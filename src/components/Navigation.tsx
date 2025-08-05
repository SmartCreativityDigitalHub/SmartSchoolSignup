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
            <Button variant="ghost" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/renew">Renew</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/report">Report</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;