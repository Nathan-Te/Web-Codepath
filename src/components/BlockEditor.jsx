import React, { useState, useRef, useCallback } from 'react';
import { ACTION_BLOCKS, CONTAINER_BLOCKS, CONDITION_BLOCKS, ALL_BLOCKS } from '../language/docs';

const genUid = () => Date.now() + Math.random();

const DRAG_MIME = 'text/plain';

// Create a new block instance from a definition
const createBlock = (blockDef) => {
  const block = { type: blockDef.id, uid: genUid() };
  if (blockDef.hasParam) block.param = blockDef.defaultParam;
  if (blockDef.id === 'if' || blockDef.id === 'while') {
    block.condition = null;
    block.children = [];
  }
  if (blockDef.id === 'repeat') {
    block.children = [];
  }
  return block;
};

// Recursively remove a block by uid from a tree, returns [newTree, removedBlock]
const removeBlockByUid = (blocks, uid) => {
  let removed = null;
  const result = [];
  for (const block of blocks) {
    if (block.uid === uid) {
      removed = block;
      continue;
    }
    const copy = { ...block };
    if (copy.children) {
      const [newChildren, r] = removeBlockByUid(copy.children, uid);
      copy.children = newChildren;
      if (r) removed = r;
    }
    if (copy.condition && copy.condition.uid === uid) {
      removed = copy.condition;
      copy.condition = null;
    }
    result.push(copy);
  }
  return [result, removed];
};

// Insert block at index in tree (targetUid=null for root)
const insertBlockAtPath = (blocks, targetUid, index, block) => {
  if (targetUid === null) {
    const result = [...blocks];
    result.splice(index, 0, block);
    return result;
  }
  return blocks.map(b => {
    if (b.uid === targetUid && b.children) {
      const copy = { ...b, children: [...b.children] };
      copy.children.splice(index, 0, block);
      return copy;
    }
    if (b.children) {
      return { ...b, children: insertBlockAtPath(b.children, targetUid, index, block) };
    }
    return b;
  });
};

// Set condition on a container block
const setConditionOnBlock = (blocks, targetUid, condition) => {
  return blocks.map(b => {
    if (b.uid === targetUid) {
      return { ...b, condition };
    }
    if (b.children) {
      return { ...b, children: setConditionOnBlock(b.children, targetUid, condition) };
    }
    return b;
  });
};

// Encode/decode drag data via text/plain
const encodeDragData = (data) => JSON.stringify(data);
const decodeDragData = (e) => {
  const raw = e.dataTransfer.getData(DRAG_MIME);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

// ---- Palette Block (draggable from palette) ----
function PaletteBlock({ blockDef, category }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData(DRAG_MIME, encodeDragData({
      source: 'palette',
      blockId: blockDef.id,
      category,
    }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        background: blockDef.color,
        color: '#fff',
        cursor: 'grab',
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: 600,
        userSelect: 'none',
      }}
    >
      {blockDef.label}
    </div>
  );
}

// ---- Drop indicator line ----
function DropIndicator({ active }) {
  if (!active) return <div style={{ height: 3 }} />;
  return (
    <div style={{
      height: 3,
      background: '#38bdf8',
      borderRadius: 2,
      margin: '2px 0',
      boxShadow: '0 0 8px #38bdf8',
    }} />
  );
}

// ---- Condition slot (inside if/while blocks) ----
function ConditionSlot({ condition, parentUid, onDropCondition, onRemoveCondition }) {
  const [over, setOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setOver(true);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    const data = decodeDragData(e);
    if (data && data.category === 'condition') {
      onDropCondition(parentUid, { type: data.blockId, uid: genUid() });
    }
  };

  const condDef = condition ? ALL_BLOCKS.find(b => b.id === condition.type) : null;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minWidth: 60,
        padding: '3px 8px',
        borderRadius: 4,
        background: condition ? (condDef?.color || '#475569') : 'rgba(0,0,0,0.3)',
        border: over ? '2px dashed #38bdf8' : '2px dashed rgba(255,255,255,0.2)',
        fontSize: 12,
        color: condition ? '#fff' : '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'border 0.15s',
      }}
    >
      {condition ? (
        <>
          <span style={{ fontWeight: 600 }}>{condition.type}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveCondition(parentUid); }}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: 'none',
              color: '#fff',
              borderRadius: 3,
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: 10,
              lineHeight: '16px',
            }}
          >
            x
          </button>
        </>
      ) : (
        <span style={{ fontStyle: 'italic' }}>condition</span>
      )}
    </div>
  );
}

// ---- Single workspace block (recursive for nesting) ----
function WorkspaceBlock({ block, index, parentUid, onDrop, onReorder, onRemove, onParamChange, onDropCondition, onRemoveCondition, dragState, setDragState }) {
  const blockDef = ALL_BLOCKS.find(b => b.id === block.type);
  const isContainer = block.children !== undefined;
  const hasCondition = block.condition !== undefined;

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData(DRAG_MIME, encodeDragData({
      source: 'workspace',
      uid: block.uid,
      parentUid,
    }));
    e.dataTransfer.effectAllowed = 'copyMove';
    setDragState({ draggingUid: block.uid });
  };

  const handleDragEnd = () => {
    setDragState({ draggingUid: null });
  };

  const isDragging = dragState.draggingUid === block.uid;

  return (
    <div style={{ opacity: isDragging ? 0.4 : 1, transition: 'opacity 0.15s' }}>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          background: blockDef?.color || '#334155',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13 }}>{blockDef?.label || block.type}</span>

        {hasCondition && (
          <ConditionSlot
            condition={block.condition}
            parentUid={block.uid}
            onDropCondition={onDropCondition}
            onRemoveCondition={onRemoveCondition}
          />
        )}

        {block.param !== undefined && (
          <input
            type="number"
            value={block.param}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onParamChange(block.uid, parseInt(e.target.value) || 1)}
            style={{
              width: 40,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              color: '#fff',
              textAlign: 'center',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
            min={1}
            max={20}
          />
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.uid); }}
          style={{
            marginLeft: 'auto',
            background: 'rgba(0,0,0,0.3)',
            border: 'none',
            color: '#fff',
            borderRadius: 4,
            cursor: 'pointer',
            padding: '2px 8px',
            fontSize: 12,
          }}
        >
          x
        </button>
      </div>

      {/* Container body for nested blocks */}
      {isContainer && (
        <DropZone
          blocks={block.children}
          parentUid={block.uid}
          onDrop={onDrop}
          onReorder={onReorder}
          onRemove={onRemove}
          onParamChange={onParamChange}
          onDropCondition={onDropCondition}
          onRemoveCondition={onRemoveCondition}
          dragState={dragState}
          setDragState={setDragState}
          nested
        />
      )}
    </div>
  );
}

// ---- Drop zone (root or nested) ----
function DropZone({ blocks, parentUid, onDrop, onReorder, onRemove, onParamChange, onDropCondition, onRemoveCondition, dragState, setDragState, nested }) {
  const [dropIndex, setDropIndex] = useState(null);
  const zoneRef = useRef(null);

  const getDropIndex = useCallback((e) => {
    if (!zoneRef.current) return blocks.length;
    const children = Array.from(zoneRef.current.children).filter(
      c => c.dataset && c.dataset.role === 'block-wrapper'
    );
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) return i;
    }
    return blocks.length;
  }, [blocks.length]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDropIndex(getDropIndex(e));
  };

  const handleDragLeave = (e) => {
    if (zoneRef.current && !zoneRef.current.contains(e.relatedTarget)) {
      setDropIndex(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const idx = getDropIndex(e);
    setDropIndex(null);
    const data = decodeDragData(e);
    if (!data) return;
    if (data.category === 'condition') return; // conditions only go in condition slots
    if (data.source === 'palette') {
      onDrop(data.blockId, parentUid, idx);
    } else if (data.source === 'workspace') {
      onReorder(data.uid, parentUid, idx);
    }
  };

  return (
    <div
      ref={zoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: nested ? 40 : 200,
        background: nested ? 'rgba(0,0,0,0.2)' : '#0f172a',
        borderRadius: nested ? 6 : 12,
        padding: nested ? '6px 6px 6px 16px' : 12,
        border: nested ? '1px solid rgba(255,255,255,0.08)' : '1px solid #334155',
        marginLeft: nested ? 12 : 0,
        marginTop: nested ? 4 : 0,
        marginBottom: nested ? 4 : 0,
        borderLeft: nested ? '3px solid rgba(255,255,255,0.15)' : undefined,
      }}
    >
      {blocks.length === 0 && dropIndex === null && (
        <div style={{ color: '#475569', textAlign: 'center', padding: nested ? 10 : 40, fontSize: nested ? 11 : 14 }}>
          {nested ? 'Drop blocks here' : 'Drag blocks here to build your program'}
        </div>
      )}
      {blocks.map((block, idx) => (
        <div key={block.uid} data-role="block-wrapper" style={{ marginBottom: 4 }}>
          <DropIndicator active={dropIndex === idx} />
          <WorkspaceBlock
            block={block}
            index={idx}
            parentUid={parentUid}
            onDrop={onDrop}
            onReorder={onReorder}
            onRemove={onRemove}
            onParamChange={onParamChange}
            onDropCondition={onDropCondition}
            onRemoveCondition={onRemoveCondition}
            dragState={dragState}
            setDragState={setDragState}
          />
        </div>
      ))}
      <DropIndicator active={dropIndex === blocks.length} />
    </div>
  );
}

// ---- Main BlockEditor component ----
export default function BlockEditor({ blocks, setBlocks }) {
  const [dragState, setDragState] = useState({ draggingUid: null });

  // Drop a new block from palette
  const handleDrop = useCallback((blockId, parentUid, index) => {
    const blockDef = ALL_BLOCKS.find(b => b.id === blockId);
    if (!blockDef) return;
    const newBlock = createBlock(blockDef);
    setBlocks(prev => insertBlockAtPath(prev, parentUid, index, newBlock));
  }, [setBlocks]);

  // Reorder an existing block
  const handleReorder = useCallback((uid, newParentUid, newIndex) => {
    setBlocks(prev => {
      const [withoutBlock, removed] = removeBlockByUid(prev, uid);
      if (!removed) return prev;
      return insertBlockAtPath(withoutBlock, newParentUid, newIndex, removed);
    });
  }, [setBlocks]);

  // Remove a block
  const handleRemove = useCallback((uid) => {
    setBlocks(prev => removeBlockByUid(prev, uid)[0]);
  }, [setBlocks]);

  // Change param on a block
  const handleParamChange = useCallback((uid, value) => {
    const updateParam = (list) => list.map(b => {
      if (b.uid === uid) return { ...b, param: value };
      if (b.children) return { ...b, children: updateParam(b.children) };
      return b;
    });
    setBlocks(prev => updateParam(prev));
  }, [setBlocks]);

  // Drop a condition onto a container
  const handleDropCondition = useCallback((containerUid, condition) => {
    setBlocks(prev => setConditionOnBlock(prev, containerUid, condition));
  }, [setBlocks]);

  // Remove condition from a container
  const handleRemoveCondition = useCallback((containerUid) => {
    setBlocks(prev => setConditionOnBlock(prev, containerUid, null));
  }, [setBlocks]);

  return (
    <div>
      {/* Block palette */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
        padding: 10,
        background: '#1e293b',
        borderRadius: 8,
        border: '1px solid #334155',
      }}>
        {/* Action blocks */}
        <div style={{ width: '100%', fontSize: 10, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Actions</div>
        {ACTION_BLOCKS.map(b => <PaletteBlock key={b.id} blockDef={b} category="action" />)}

        {/* Container blocks */}
        <div style={{ width: '100%', fontSize: 10, color: '#64748b', marginBottom: 2, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Control</div>
        {CONTAINER_BLOCKS.map(b => <PaletteBlock key={b.id} blockDef={b} category="container" />)}

        {/* Condition blocks */}
        <div style={{ width: '100%', fontSize: 10, color: '#64748b', marginBottom: 2, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Conditions</div>
        {CONDITION_BLOCKS.map(b => <PaletteBlock key={b.id} blockDef={b} category="condition" />)}
      </div>

      {/* Block workspace */}
      <DropZone
        blocks={blocks}
        parentUid={null}
        onDrop={handleDrop}
        onReorder={handleReorder}
        onRemove={handleRemove}
        onParamChange={handleParamChange}
        onDropCondition={handleDropCondition}
        onRemoveCondition={handleRemoveCondition}
        dragState={dragState}
        setDragState={setDragState}
      />
    </div>
  );
}
