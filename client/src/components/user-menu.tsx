import { useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useStore } from "@/lib/api-store";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { user: storeUser } = useStore();
  const navigate = useNavigate();
  const role = storeUser?.role ?? "user";

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      logout();
      navigate({ to: "/" });
      toast.success("Logged out successfully");
    } catch (err) {
      logout(); // Fallback
      navigate({ to: "/" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2 hover:bg-accent/50 transition-colors">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 shadow-elegant">
        <div className="px-2 py-2.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            {role === "admin" && (
              <Badge className="h-4 text-[10px] px-1.5 bg-primary/15 text-primary border-primary/20 flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" /> Admin
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })} className="cursor-pointer">
          <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
