import * as d3 from 'd3'
import type { GraphNode, GraphLink } from '~/types'

interface ForceGraphOptions {
  container: HTMLElement
  width: number
  height: number
  onNodeClick: (node: GraphNode) => void
  activeNodeId: string | null
}

export function useForceGraph() {
  let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
  let tooltipEl: HTMLDivElement | null = null
  let containerEl: HTMLElement | null = null

  const init = (options: ForceGraphOptions, nodes: GraphNode[], links: GraphLink[]) => {
    const { container, width, height, onNodeClick, activeNodeId } = options
    containerEl = container

    // Clear existing (including previous tooltip)
    if (tooltipEl) {
      tooltipEl.remove()
      tooltipEl = null
    }
    d3.select(container).selectAll('*').remove()

    // Create SVG
    svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Defs for gradients and glows
    const defs = svg.append('defs')

    // Glow filter
    const glowFilter = defs.append('filter').attr('id', 'glow')
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur')
    const feMerge = glowFilter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Active glow filter (stronger)
    const activeGlow = defs.append('filter').attr('id', 'active-glow')
    activeGlow.append('feGaussianBlur').attr('stdDeviation', '8').attr('result', 'coloredBlur')
    const activeMerge = activeGlow.append('feMerge')
    activeMerge.append('feMergeNode').attr('in', 'coloredBlur')
    activeMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Create gradient for each link
    links.forEach((link, i) => {
      const sourceNode = nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id))
      const targetNode = nodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id))
      if (!sourceNode || !targetNode) return

      const gradient = defs.append('linearGradient')
        .attr('id', `link-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')

      gradient.append('stop').attr('offset', '0%').attr('stop-color', sourceNode.color).attr('stop-opacity', 0.6)
      gradient.append('stop').attr('offset', '100%').attr('stop-color', targetNode.color).attr('stop-opacity', 0.6)
    })

    // Zoom
    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Force simulation
    const minRadius = 20
    const maxRadius = 55
    const maxCount = Math.max(...nodes.map(n => n.noteCount), 1)

    const getRadius = (n: GraphNode) =>
      minRadius + ((n.noteCount / maxCount) * (maxRadius - minRadius))

    simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(100)
        .strength(0.6))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => getRadius(d) + 15))

    // Links
    const linkGroup = g.append('g').attr('class', 'links')

    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.max(1.5, Math.min(d.count * 1.5, 6)))
      .attr('stroke', (_d, i) => `url(#link-gradient-${i})`)
      .attr('stroke-opacity', 0.4)

    // Link count labels
    const linkLabels = linkGroup.selectAll('text')
      .data(links)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-8')
      .attr('fill', '#5c5c7e')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.count > 1 ? `${d.count}` : '')

    // Node groups
    const nodeGroup = g.append('g').attr('class', 'nodes')

    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation!.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation!.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    // Outer glow ring for active node
    nodeElements.append('circle')
      .attr('r', d => getRadius(d) + 6)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', d => d.id === activeNodeId ? 0.6 : 0)
      .attr('filter', 'url(#active-glow)')
      .attr('class', 'active-ring')

    // Main circle
    nodeElements.append('circle')
      .attr('r', d => getRadius(d))
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.15)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .on('mouseenter', function(this: SVGCircleElement) {
        d3.select(this)
          .transition().duration(200)
          .attr('fill-opacity', 0.3)
          .attr('stroke-width', 3)
      })
      .on('mouseleave', function(this: SVGCircleElement) {
        d3.select(this)
          .transition().duration(200)
          .attr('fill-opacity', 0.15)
          .attr('stroke-width', 2)
      })

    // Node icon / count
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', d => d.color)
      .attr('font-size', d => Math.max(12, getRadius(d) * 0.5) + 'px')
      .attr('font-weight', '700')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.noteCount)

    // Node label
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getRadius(d) + 18)
      .attr('fill', '#b4b4cf')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.name)

    // Click handler
    nodeElements.on('click', (_event, d) => {
      onNodeClick(d)
    })

    // Tooltip
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'absolute pointer-events-none bg-brain-800/95 backdrop-blur-sm border border-brain-700/50 rounded-lg px-3 py-2 text-xs text-brain-200 shadow-xl opacity-0 transition-opacity duration-150 z-10')
      .style('position', 'absolute')
    tooltipEl = tooltip.node() as HTMLDivElement

    nodeElements
      .on('mouseenter', (event, d) => {
        tooltip
          .html(`<span class="font-semibold" style="color: ${d.color}">${d.name}</span><br/><span class="text-brain-400">${d.noteCount} note${d.noteCount !== 1 ? 's' : ''}</span>`)
          .style('opacity', '1')
          .style('left', `${event.offsetX + 15}px`)
          .style('top', `${event.offsetY - 10}px`)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.offsetX + 15}px`)
          .style('top', `${event.offsetY - 10}px`)
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', '0')
      })

    // Tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!)

      linkLabels
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2)

      nodeElements
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Initial animation
    simulation.alpha(1).restart()
  }

  const destroy = () => {
    simulation?.stop()
    simulation = null
    if (tooltipEl) {
      tooltipEl.remove()
      tooltipEl = null
    }
    if (containerEl) {
      d3.select(containerEl).selectAll('*').remove()
      containerEl = null
    }
    svg = null
  }

  return { init, destroy }
}
