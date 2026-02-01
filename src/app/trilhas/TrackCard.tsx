export function TrackCard({
  title,
  promise,
  audience,
  color,
  onClick
}: {
  title: string;
  promise: string;
  audience: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        cursor-pointer
        transform
        transition-all
        duration-500
        hover:scale-105
        hover:-rotate-1
      "
    >
      {/* Card base (estilo Uiverse) */}
      <div
        className="
          relative
          rounded-3xl
          border
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
          p-7
          bg-black/80
          text-white
          transition-all
          duration-500
        "
        style={{
          borderColor: `${color}55`,
          boxShadow: `0 0 0 1px ${color}22`
        }}
      >
        {/* Glow colorido */}
        <div
          className="absolute -bottom-16 -left-16 w-40 h-40 blur-3xl opacity-30 group-hover:opacity-50 transition"
          style={{ background: color }}
        />

        {/* Shine passando */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r from-transparent via-white/10 to-transparent
            -skew-x-12
            translate-x-full
            group-hover:translate-x-[-200%]
            transition-transform
            duration-1000
          "
        />

        {/* Conteúdo */}
        <div className="relative z-10 text-left space-y-3">

          {/* Bolinha da cor */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: color }}
          />

          <h2 className="text-xl font-bold">{title}</h2>

          <p className="text-xs opacity-70">
            👥 {audience}
          </p>

          <p className="text-sm font-medium">
            {promise}
          </p>

          <p className="text-xs opacity-60">
            👉 Procure por esta cor nas salas e atividades
          </p>

          <span
            className="text-sm font-semibold"
            style={{ color }}
          >
            Seguir trilha →
          </span>
        </div>
      </div>
    </button>
  );
}
