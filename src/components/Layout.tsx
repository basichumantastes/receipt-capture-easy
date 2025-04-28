
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ReceiptText, LogOut } from "lucide-react";

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <ReceiptText className="h-5 w-5 text-expense-blue" />
            <span>Receipt Capture</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user && (
                  <div className="flex items-center gap-2">
                    {user.user_metadata?.avatar_url && (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt={user.user_metadata.name || user.email || ""} 
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Déconnexion</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/login")} variant="default" size="sm">
                Connexion
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          Receipt Capture &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
