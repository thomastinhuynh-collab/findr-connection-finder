const stats = [
  { number: "847", label: "recherches actives" },
  { number: "2 341", label: "membres" },
  { number: "94%", label: "de satisfaction" },
  { number: "100%", label: "Paiement sécurisé" },
];

export const SocialProofBar = () => {
  return (
    <div
      className="w-full py-4 md:py-0 md:h-16 flex items-center justify-center"
      style={{ backgroundColor: "#1B2A4A" }}
    >
      <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:gap-10 gap-x-8 gap-y-4 px-4 md:px-0">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            {/* Stat item */}
            <div className="flex flex-col items-center text-center min-w-[100px]">
              <span
                className="text-base font-bold"
                style={{ color: "#C9A84C" }}
              >
                {stat.number}
              </span>
              <span
                className="text-xs font-normal"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {stat.label}
              </span>
            </div>

            {/* Divider - not after last item */}
            {index < stats.length - 1 && (
              <div
                className="hidden md:block ml-10"
                style={{
                  width: "1px",
                  height: "28px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialProofBar;
