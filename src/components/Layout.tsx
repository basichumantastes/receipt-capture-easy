
import React from "react";
import { Outlet, Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ReceiptText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Layout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <ReceiptText className="h-5 w-5 text-expense-blue" />
            <span>Receipt Scanner</span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url && (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata.full_name || "Profile"} 
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="hidden md:inline text-sm font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Déconnexion</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          Receipt Scanner &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
