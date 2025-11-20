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
  const [search, setSearch] = useState('');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const tableList: string[] = schema?.tables ?? [];
    const columns: ErdColumn[] = schema?.columns ?? [];
    const relations: ErdRelation[] = schema?.relations ?? [];

    tableList.forEach((table, index) => {
      // semua kolom tetap diambil dari DB, kita hanya batasi jumlah yang ditampilkan di node
      const allTableColumns = columns.filter((c) => c.table === table);
      const tableColumns = allTableColumns.slice(0, 8);
      const colLines = tableColumns.map((c) => `${c.name}: ${c.type}`).join('\n');

      const x = (index % 4) * 280;
      const y = Math.floor(index / 4) * 220;

      const isSelected = selectedTable === table;
      const isSearchMatch = search
        ? table.toLowerCase().includes(search.toLowerCase())
        : false;

      nodes.push({
        id: table,
        data: {
          label: (
            <div className="text-[11px] leading-tight text-slate-50">
              <div className="font-semibold mb-1 text-slate-50">{table}</div>
              {tableColumns.length > 0 && (
                <pre className="whitespace-pre-wrap leading-tight text-[10px] max-h-32 overflow-auto text-slate-100">
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
          border: isSelected
            ? '2px solid #38BDF8'
            : isSearchMatch
            ? '2px solid #A855F7'
            : '1px solid #4B5563',
          backgroundColor: '#020617',
          color: '#F9FAFB',
          minWidth: 180,
        },
      });
    });

    relations.forEach((rel, index) => {
      if (!rel.referenced_table) return;
      const isFromSelected = selectedTable && rel.table === selectedTable;
      const isToSelected = selectedTable && rel.referenced_table === selectedTable;
      const edgeId = `e-${index}`;
      const isThisSelectedEdge = selectedEdgeId === edgeId;
      edges.push({
        id: edgeId,
        source: rel.table,
        target: rel.referenced_table,
        label: `${rel.column} -> ${rel.referenced_table}.${rel.referenced_column}`,
        type: 'smoothstep',
        animated: isThisSelectedEdge || isFromSelected || isToSelected ? true : false,
        style: {
          stroke: isThisSelectedEdge
            ? '#F97316' // edge yang dipilih paling menonjol
            : isFromSelected || isToSelected
            ? '#38BDF8'
            : '#4F46E5',
          strokeWidth: isThisSelectedEdge ? 3 : 1.5,
        },
        labelStyle: { fontSize: 11, fill: '#F9FAFB', background: '#020617' },
      });
    });

    return { nodes, edges };
  }, [schema, selectedTable, selectedEdgeId, search]);

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
      <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
        <div className="flex-1 border-r border-slate-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
            <div className="text-xs md:text-sm font-semibold tracking-wide text-slate-200">
              Database ERD Viewer
            </div>
            <input
              type="text"
              placeholder="Cari tabel..."
              className="text-xs md:text-sm px-2 py-1 rounded-md bg-slate-800 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodeClick={(_, node) => {
              setSelectedTable(node.id as string);
              setSelectedRelation(null);
              setSelectedEdgeId(null);
            }}
            onEdgeClick={(_, edge) => {
              const relIndex = parseInt(edge.id.replace('e-', ''), 10);
              const rel = (schemaData.relations || [])[relIndex];
              if (rel) {
                setSelectedRelation(rel);
                setSelectedTable(null);
                setSelectedEdgeId(edge.id);
              }
            }}
          >
            <MiniMap />
            <Controls />
            <Background gap={16} color="#1F2937" />
          </ReactFlow>
        </div>
        <div className="w-80 p-4 bg-slate-900 border-l border-slate-800 overflow-auto text-sm">
          {selectedTable && (
            <div>
              <h2 className="font-semibold mb-2 text-sky-400">Table: {selectedTable}</h2>
              <h3 className="font-medium mb-1 text-slate-100">Columns</h3>
              <ul className="list-disc list-inside space-y-1">
                {(tableColumnsMap[selectedTable] || []).map((c) => (
                  <li key={c.name}>
                    <span className="font-mono text-xs">{c.name}</span>
                    <span className="text-xs text-slate-400"> : {c.type}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-medium mt-3 mb-1 text-slate-100">Outgoing Relations</h3>
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
              <h2 className="font-semibold mb-2 text-sky-400">Relation</h2>
              <p className="text-xs text-slate-100">
                {selectedRelation.table}.{selectedRelation.column} ··{' '}
                {selectedRelation.referenced_table}.{selectedRelation.referenced_column}
              </p>
            </div>
          )}

          {!selectedTable && !selectedRelation && (
            <div className="text-xs text-slate-400">
              Klik tabel atau garis relasi pada diagram untuk melihat detail di sini.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
