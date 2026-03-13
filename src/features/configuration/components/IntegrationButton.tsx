interface IntegrationButtonProps {
  name: string;
  icon: string;
  connected?: boolean;
  onClick?: () => void;
}

export function IntegrationButton({
  name,
  icon,
  connected = false,
  onClick,
}: IntegrationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
        ${
          connected
            ? "bg-[#993331]/10 border-[#993331]/20 text-[#993331]"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{name}</span>
      {connected && (
        <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
      )}
    </button>
  );
}
