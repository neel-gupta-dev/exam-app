"use client";

// ────────────────────────────────────────────────────────────
// RankTrendChart — Pure SVG chart for historical closing ranks
// No external chart library needed.
// Shows JoSAA (blue) and optionally CSAB (amber) trends.
// ────────────────────────────────────────────────────────────

interface TrendPoint {
  year: number;
  closing_rank: number;
}

interface RankTrendChartProps {
  josaa: TrendPoint[];
  csab: TrendPoint[];
  isBits?: boolean;
}

const W = 260;
const H = 90;
const PAD = { top: 10, right: 10, bottom: 24, left: 46 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  return points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
}

function formatRank(r: number) {
  if (r >= 1000) return `${(r / 1000).toFixed(1)}k`;
  return String(r);
}

export default function RankTrendChart({ josaa, csab, isBits }: RankTrendChartProps) {
  const hasJosaa = josaa.length > 0;
  const hasCsab  = csab.length > 0;

  if (!hasJosaa && !hasCsab) {
    return (
      <div className="flex items-center justify-center h-20 text-xs text-gray-600">
        Not enough historical data
      </div>
    );
  }

  const allPoints = [...josaa, ...csab];
  const allRanks  = allPoints.map(p => p.closing_rank);
  const allYears  = allPoints.map(p => p.year);
  const minRank   = Math.min(...allRanks);
  const maxRank   = Math.max(...allRanks);
  const minYear   = Math.min(...allYears);
  const maxYear   = Math.max(...allYears);

  const rankPad = (maxRank - minRank) * 0.15 || 100;
  const lo = minRank - rankPad;
  const hi = maxRank + rankPad;

  function xOf(year: number) {
    if (minYear === maxYear) return PAD.left + chartW / 2;
    return PAD.left + ((year - minYear) / (maxYear - minYear)) * chartW;
  }
  // NOTE: rank axis is inverted (lower rank = better = top of chart)
  function yOf(rank: number) {
    return PAD.top + ((rank - lo) / (hi - lo)) * chartH;
  }

  const josaaXY = josaa.map(p => ({ x: xOf(p.year), y: yOf(p.closing_rank), ...p }));
  const csabXY  = csab.map(p => ({ x: xOf(p.year), y: yOf(p.closing_rank), ...p }));

  const uniqueYears = Array.from(new Set(allYears)).sort((a, b) => a - b);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 120 }}
        aria-label="Historical closing rank trend chart"
      >
        {/* Y grid lines */}
        {[0, 0.5, 1].map(t => {
          const y = PAD.top + t * chartH;
          const rankVal = Math.round(hi - t * (hi - lo));
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1e2d4a" strokeWidth="1" />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize="7" fill="#64748b">
                {formatRank(rankVal)}
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {uniqueYears.map(yr => (
          <text key={yr} x={xOf(yr)} y={H - 4} textAnchor="middle" fontSize="7" fill="#64748b">
            {yr}
          </text>
        ))}

        {/* JoSAA line */}
        {hasJosaa && (
          <g>
            <path d={buildPath(josaaXY)} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
            {josaaXY.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
                <title>{`JoSAA ${p.year}: ${isBits ? p.closing_rank : formatRank(p.closing_rank)}`}</title>
              </g>
            ))}
          </g>
        )}

        {/* CSAB line */}
        {hasCsab && (
          <g>
            <path d={buildPath(csabXY)} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />
            {csabXY.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" />
                <title>{`CSAB ${p.year}: ${isBits ? p.closing_rank : formatRank(p.closing_rank)}`}</title>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 justify-center">
        {hasJosaa && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-500 rounded" />
            <span className="text-[9px] text-gray-400">JoSAA Rd. 2</span>
          </div>
        )}
        {hasCsab && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-amber-400 rounded" style={{ borderTop: "1px dashed #f59e0b" }} />
            <span className="text-[9px] text-gray-400">CSAB Rd. 2</span>
          </div>
        )}
      </div>
    </div>
  );
}
