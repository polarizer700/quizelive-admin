import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = {
  label: string;
  value: number;
  secondary?: number;
};

export function TrendArea({
  data,
  primaryLabel = "Значение",
  secondaryLabel,
}: {
  data: TrendPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="grid h-56 place-items-center text-sm text-stone-400">Пока нет данных</div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="trendPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="trendSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(28,25,23,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#78716c", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#78716c", fontSize: 11 }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.92)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={primaryLabel}
            stroke="#ea580c"
            strokeWidth={2.5}
            fill="url(#trendPrimary)"
            isAnimationActive
            animationDuration={800}
          />
          {secondaryLabel ? (
            <Area
              type="monotone"
              dataKey="secondary"
              name={secondaryLabel}
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#trendSecondary)"
              isAnimationActive
              animationDuration={800}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
