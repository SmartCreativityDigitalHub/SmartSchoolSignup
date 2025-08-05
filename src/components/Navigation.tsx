import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              SmartSchool
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/admin-login">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
            <Link to="/affiliate-login">
              <Button variant="outline" size="sm">
                Affiliate Login
              </Button>
            </Link>
            <Link to="/affiliate-signup">
              <Button variant="default" size="sm">
                Join as Affiliate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;