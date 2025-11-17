import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import ForceGraph2D, { NodeObject, LinkObject } from 'react-force-graph-2d';
import { somniaPartners } from '@/shared/somniaPartners';

const BASE_NODE_RADIUS = 18;
const HOVER_SCALE_FACTOR = 1.4;
const PARTNER_SCALE_DOWN = 1.5;
const CENTRAL_NODE_ID = 'Somnia';

interface PartnerNode extends NodeObject {
  id: string;
  name: string;
  description: string;
  logo: string;
}

const imageCache = new Map<string, HTMLImageElement>();

export const SomniaPartners = () => {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [hoveredNode, setHoveredNode] = useState<PartnerNode | null>(null);
  const graphRef = useRef<any>();

  useEffect(() => {
    let isMounted = true;
    const loadAndCacheImages = async () => {
      const nodesToLoad = somniaPartners.nodes.filter(
        (node) => !imageCache.has(node.id)
      );
      const promises = nodesToLoad.map(
        (node) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = node.logo;
            img.onload = () => {
              imageCache.set(node.id, img);
              resolve();
            };
            img.onerror = () => {
              console.error(
                `Failed to load image for ${node.id}: ${node.logo}`
              );
              resolve();
            };
          })
      );
      await Promise.all(promises);
      if (isMounted) {
        const allImages: Record<string, HTMLImageElement> = {};
        somniaPartners.nodes.forEach((node) => {
          if (imageCache.has(node.id)) {
            allImages[node.id] = imageCache.get(node.id)!;
          }
        });
        setImages(allImages);
      }
    };
    loadAndCacheImages();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-400);
      graphRef.current.d3Force('link').distance(120);
    }
  }, []);

  const handleNodeDragEnd = useCallback((node: NodeObject) => {
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHoveredNode(node as PartnerNode | null);
  }, []);

  const getNodeRadius = useCallback(
    (node: PartnerNode) => {
      const isCentral = node.id === CENTRAL_NODE_ID;
      const isHovered = hoveredNode?.id === node.id;

      const baseRadius = isCentral
        ? BASE_NODE_RADIUS
        : BASE_NODE_RADIUS / PARTNER_SCALE_DOWN;

      return baseRadius * (isHovered ? HOVER_SCALE_FACTOR : 1);
    },
    [hoveredNode]
  );

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D) => {
      const { x, y } = node as any;
      const typedNode = node as PartnerNode;
      const radius = getNodeRadius(typedNode);
      const img = images[typedNode.id];

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.closePath();

      if (hoveredNode?.id === typedNode.id) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 20;
      }

      if (img) {
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      }

      ctx.restore();
    },
    [images, hoveredNode, getNodeRadius]
  );

  const nodePointerAreaPaint = useCallback(
    (node: NodeObject, color: string, ctx: CanvasRenderingContext2D) => {
      const { x, y } = node as any;
      const typedNode = node as PartnerNode;
      const radius = getNodeRadius(typedNode);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
    },
    [getNodeRadius]
  );

  const linkCanvasObject = useCallback(
    (link: LinkObject, ctx: CanvasRenderingContext2D) => {
      const sourceNode = link.source as PartnerNode;
      const targetNode = link.target as PartnerNode;

      const start = { x: sourceNode.x ?? 0, y: sourceNode.y ?? 0 };
      const end = { x: targetNode.x ?? 0, y: targetNode.y ?? 0 };

      const sourceRadius = getNodeRadius(sourceNode);
      const targetRadius = getNodeRadius(targetNode);

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return;

      const nx = dx / distance;
      const ny = dy / distance;

      const adjustedStart = {
        x: start.x + nx * sourceRadius,
        y: start.y + ny * sourceRadius,
      };
      const adjustedEnd = {
        x: end.x - nx * targetRadius,
        y: end.y - ny * targetRadius,
      };

      if (adjustedStart.x * nx > adjustedEnd.x * nx) return;

      ctx.beginPath();
      ctx.moveTo(adjustedStart.x, adjustedStart.y);
      ctx.lineTo(adjustedEnd.x, adjustedEnd.y);
      ctx.strokeStyle = link.color || 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
    [getNodeRadius]
  );

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={somniaPartners}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeHover={handleNodeHover}
        nodePointerAreaPaint={nodePointerAreaPaint}
        onNodeDragEnd={handleNodeDragEnd}
        enableNodeDrag
        enablePointerInteraction
        backgroundColor="#1a1a1a"
        cooldownTicks={100}
      />
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            maxWidth: '300px',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>
            {hoveredNode.name}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9em' }}>
            {hoveredNode.description}
          </p>
        </div>
      )}
    </div>
  );
};

SomniaPartners.displayName = 'SomniaPartners';
