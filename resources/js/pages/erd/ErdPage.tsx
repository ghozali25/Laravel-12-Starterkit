import React, { useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
} from 'react-flow-renderer';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

interface ErdColumn {
  table: string;
  name: string;
  type: string;
}

interface ErdRelation {
  table: string;
  column: string;
  referenced_table: string;
  referenced_column: string;
}

interface ErdSchema {
  tables: string[];
  columns: ErdColumn[];
  relations: ErdRelation[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'ERD', href: '/erd' },
];

export default function ErdPage() {
  const { schema } = usePage<SharedData & { schema: ErdSchema }>().props as any;
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<ErdRelation | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const tableList: string[] = schema?.tables ?? [];
    const columns: ErdColumn[] = schema?.columns ?? [];
    const relations: ErdRelation[] = schema?.relations ?? [];

    tableList.forEach((table, index) => {
      const tableColumns = columns.filter((c) => c.table === table).slice(0, 8);
      const colLines = tableColumns.map((c) => `${c.name}: ${c.type}`).join('\n');

      const x = (index % 4) * 280;
      const y = Math.floor(index / 4) * 220;

      nodes.push({
        id: table,
        data: {
          label: (
            <div className="text-xs">
              <div className="font-semibold mb-1">{table}</div>
              {tableColumns.length > 0 && (
                <pre className="whitespace-pre-wrap leading-tight text-[10px] max-h-32 overflow-auto">
                  {colLines}
                </pre>
              )}
            </div>
          ),
        },
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          borderRadius: 8,
          padding: 8,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          minWidth: 180,
        },
      });
    });

    relations.forEach((rel, index) => {
      if (!rel.referenced_table) return;
      edges.push({
        id: `e-${index}`,
        source: rel.table,
        target: rel.referenced_table,
        label: `${rel.column} -> ${rel.referenced_table}.${rel.referenced_column}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6366F1' },
        labelStyle: { fontSize: 10, fill: '#374151' },
      });
    });

    return { nodes, edges };
  }, [schema]);

  const schemaData: ErdSchema = schema;

  const tableColumnsMap = useMemo(() => {
    const map: Record<string, ErdColumn[]> = {};
    (schemaData.columns || []).forEach((c) => {
      if (!map[c.table]) map[c.table] = [];
      map[c.table].push(c);
    });
    return map;
  }, [schemaData]);

  const tableRelationsMap = useMemo(() => {
    const map: Record<string, ErdRelation[]> = {};
    (schemaData.relations || []).forEach((r) => {
      if (!map[r.table]) map[r.table] = [];
      map[r.table].push(r);
    });
    return map;
  }, [schemaData]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="ERD" />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 border-r">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodeClick={(_, node) => {
              setSelectedTable(node.id as string);
              setSelectedRelation(null);
            }}
            onEdgeClick={(_, edge) => {
              const relIndex = parseInt(edge.id.replace('e-', ''), 10);
              const rel = (schemaData.relations || [])[relIndex];
              if (rel) {
                setSelectedRelation(rel);
                setSelectedTable(null);
              }
            }}
          >
            <MiniMap />
            <Controls />
            <Background gap={16} color="#E5E7EB" />
          </ReactFlow>
        </div>
        <div className="w-80 p-4 bg-white border-l overflow-auto text-sm">
          {selectedTable && (
            <div>
              <h2 className="font-semibold mb-2">Table: {selectedTable}</h2>
              <h3 className="font-medium mb-1">Columns</h3>
              <ul className="list-disc list-inside space-y-1">
                {(tableColumnsMap[selectedTable] || []).map((c) => (
                  <li key={c.name}>
                    <span className="font-mono text-xs">{c.name}</span>
                    <span className="text-xs text-gray-500"> : {c.type}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-medium mt-3 mb-1">Outgoing Relations</h3>
              <ul className="list-disc list-inside space-y-1">
                {(tableRelationsMap[selectedTable] || []).map((r, idx) => (
                  <li key={idx}>
                    {r.column} ·· {r.referenced_table}.{r.referenced_column}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!selectedTable && selectedRelation && (
            <div>
              <h2 className="font-semibold mb-2">Relation</h2>
              <p className="text-xs">
                {selectedRelation.table}.{selectedRelation.column} ··{' '}
                {selectedRelation.referenced_table}.{selectedRelation.referenced_column}
              </p>
            </div>
          )}

          {!selectedTable && !selectedRelation && (
            <div className="text-xs text-gray-500">
              Klik tabel atau garis relasi pada diagram untuk melihat detail di sini.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
