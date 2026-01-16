import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

interface UserBadgeProps {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  isPremium?: boolean;
  size?: "sm" | "md" | "lg";
  showCrown?: boolean;
}

const UserBadge = ({ 
  userId, 
  fullName, 
  avatarUrl, 
  isPremium = false, 
  size = "md",
  showCrown = true 
}: UserBadgeProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profil/${userId}`);
  };

  const sizeClasses = {
    sm: { avatar: "w-6 h-6", text: "text-xs", crown: "w-3 h-3" },
    md: { avatar: "w-7 h-7", text: "text-sm", crown: "w-4 h-4" },
    lg: { avatar: "w-8 h-8", text: "text-sm", crown: "w-4 h-4" },
  };

  const sizes = sizeClasses[size];

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 group/user hover:opacity-80 transition-opacity"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName || "User"}
          className={`${sizes.avatar} rounded-full object-cover border-2 border-transparent group-hover/user:border-accent transition-colors`}
        />
      ) : (
        <div className={`${sizes.avatar} rounded-full bg-primary text-primary-foreground flex items-center justify-center ${sizes.text} font-medium`}>
          {fullName?.charAt(0) || "U"}
        </div>
      )}
      <span className={`${sizes.text} text-muted-foreground group-hover/user:text-accent transition-colors`}>
        {fullName || "Utilisateur"}
      </span>
      {showCrown && isPremium && (
        <Crown className={`${sizes.crown} text-accent`} />
      )}
    </button>
  );
};

export default UserBadge;
