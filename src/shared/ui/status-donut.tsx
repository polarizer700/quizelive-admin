import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const DEFAULT_COLORS = ["#2b4bff", "#ff5da2", "#4fe3b0", "#d8d4c8", "#e8ff47"];

export type DonutSlice = {
  name: string;
  value: number;
  color?: string;
};

export function StatusDonut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[];
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const data = slices.filter((slice) => slice.value > 0);
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return (
      <div className="grid h-48 place-items-center text-sm text-stone-400">Пока нет данных</div>
    );
  }

  return (
    <div className="relative h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="86%"
            paddingAngle={3}
            stroke="none"
            isAnimationActive
            animationDuration={700}
          >
            {data.map((slice, index) => (
              <Cell key={slice.name} fill={slice.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [String(value ?? 0), ""]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.92)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue !== undefined) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            {centerValue !== undefined ? (
              <p className="text-2xl font-semibold text-stone-950">{centerValue}</p>
            ) : null}
            {centerLabel ? <p className="text-xs text-stone-500">{centerLabel}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
