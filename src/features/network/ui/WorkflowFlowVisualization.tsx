'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react'
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase'
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel'
import { sortWorkflowSteps } from '../logic/workflowHelpers'
import type { WorkflowWithStepsRow } from '@/zero/network/queries'
import { useTranslation } from '@/features/shared/hooks/use-translation'

interface WorkflowNode extends Node {
  data: {
    label: string
    stepIndex: number
    role: 'first' | 'middle' | 'last'
  }
}

interface WorkflowFlowVisualizationProps {
  workflow: WorkflowWithStepsRow
}

// Color palette matching the group network hierarchy style
const NODE_COLORS = {
  first: { bg: '#c8e6c9', border: '#a5d6a7', stroke: '#66bb6a' },   // green – start
  middle: { bg: '#bbdefb', border: '#90caf9', stroke: '#42a5f5' },   // blue – intermediate
  last: { bg: '#ffe0b2', border: '#ffcc80', stroke: '#ffb74d' },     // orange – end
} as const

export function WorkflowFlowVisualization({ workflow }: WorkflowFlowVisualizationProps) {
  const { t } = useTranslation()
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [legendCollapsed, setLegendCollapsed] = useState(false)
  const [isInteractive, setIsInteractive] = useState(true)

  const sortedSteps = useMemo(() => sortWorkflowSteps(workflow.steps), [workflow.steps])

  const buildGraph = useCallback(() => {
    if (sortedSteps.length === 0) return { nodes: [] as WorkflowNode[], edges: [] as Edge[] }

    const totalSteps = sortedSteps.length
    // Lay steps out in a horizontal line, spaced 280px apart
    const newNodes: WorkflowNode[] = sortedSteps.map((step, index) => {
      const role: 'first' | 'middle' | 'last' =
        index === 0 ? 'first' : index === totalSteps - 1 ? 'last' : 'middle'
      const colors = NODE_COLORS[role]

      return {
        id: step.id,
        type: 'default',
        position: { x: index * 280, y: 120 },
        data: {
          label: step.group?.name ?? step.label ?? `Step ${index + 1}`,
          stepIndex: index,
          role,
        },
        style: {
          background: colors.bg,
          color: '#333',
          border: `2px solid ${colors.border}`,
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center' as const,
        },
      }
    })

    const newEdges: Edge[] = sortedSteps.slice(0, -1).map((step, index) => {
      const nextStep = sortedSteps[index + 1]
      const role: 'first' | 'middle' | 'last' =
        index === 0 ? 'first' : index === totalSteps - 2 ? 'last' : 'middle'
      const colors = NODE_COLORS[role]

      return {
        id: `edge-${step.id}-${nextStep.id}`,
        source: step.id,
        target: nextStep.id,
        type: 'rightsLabel',
        animated: true,
        style: { stroke: colors.stroke, strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: colors.stroke },
        data: {
          rights: [`Step ${index + 1} → ${index + 2}`],
          sourceName: newNodes[index].data.label,
          targetName: newNodes[index + 1].data.label,
        },
      }
    })

    return { nodes: newNodes, edges: newEdges }
  }, [sortedSteps])

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph()
    setNodes(n)
    setEdges(e)
  }, [buildGraph, setNodes, setEdges])

  const handleInteractiveChange = useCallback((interactive: boolean) => {
    setIsInteractive(interactive)
  }, [])

  if (sortedSteps.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t('features.network.workflows.noSteps', 'No steps to visualize.')}
      </p>
    )
  }

  return (
    <NetworkFlowBase
      nodes={nodes}
      edges={edges}
      nodesDraggable={isInteractive}
      nodesFocusable={isInteractive}
      nodesConnectable={false}
      edgesFocusable={isInteractive}
      onNodesChange={isInteractive ? onNodesChange : undefined}
      onEdgesChange={isInteractive ? onEdgesChange : undefined}
      onInteractiveChange={handleInteractiveChange}
      panel={
        <NetworkControlPanel
          title={workflow.name ?? t('features.network.workflows.title', 'Workflow')}
          description={workflow.description ?? undefined}
          panelCollapsed={panelCollapsed}
          onPanelCollapsedChange={setPanelCollapsed}
          legendCollapsed={legendCollapsed}
          onLegendCollapsedChange={setLegendCollapsed}
          legendTitle={t('common.network.legend', 'Legend')}
          legendItems={[
            {
              id: 'start-step',
              label: t('features.network.workflows.legendStart', 'Start step'),
              swatchClassName: 'h-4 w-4 rounded border border-[#a5d6a7] bg-[#c8e6c9]',
            },
            {
              id: 'intermediate-step',
              label: t('features.network.workflows.legendIntermediate', 'Intermediate step'),
              swatchClassName: 'h-4 w-4 rounded border border-[#90caf9] bg-[#bbdefb]',
            },
            {
              id: 'end-step',
              label: t('features.network.workflows.legendEnd', 'End step'),
              swatchClassName: 'h-4 w-4 rounded border border-[#ffcc80] bg-[#ffe0b2]',
            },
          ]}
          showDisplayControls={false}
          showInteractiveToggle
          isInteractive={isInteractive}
          onInteractiveChange={setIsInteractive}
          lockLabel={t('common.network.lockEditor')}
          unlockLabel={t('common.network.unlockEditor')}
        />
      }
    />
  )
}
