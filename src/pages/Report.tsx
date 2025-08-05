import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, FileText, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

const Report = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast } = useToast();
  
  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const categories = [
    { value: "affiliates", label: "Affiliate" },
    { value: "contact_messages", label: "Contact Messages" },
    { value: "discount_codes", label: "Discount Codes" },
    { value: "renewals", label: "Renewals" },
    { value: "payment_evidence", label: "Payment Evidence" },
    { value: "profiles", label: "Profile" },
    { value: "school_signups", label: "School Signups" }
  ];

  const handleFilter = async () => {
    if (!selectedCategory) {
      toast({
        title: "Selection Required",
        description: "Please select a category to view data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const offset = (currentPage - 1) * recordsPerPage;
      
      // Get total count
      const { count } = await supabase
        .from(selectedCategory as any)
        .select('*', { count: 'exact', head: true });
      
      setTotalRecords(count || 0);

      // Get data with pagination
      const { data: result, error } = await supabase
        .from(selectedCategory as any)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + recordsPerPage - 1);

      if (error) throw error;

      setData(result || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    if (key.includes('amount') || key.includes('price')) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(Number(value));
    }
    if (key.includes('date') || key.includes('at')) {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleFilter();
  };

  const renderTable = () => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No data found for the selected category.</p>
        </div>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.slice(0, 6).map((column) => (
                  <TableHead key={column} className="font-semibold">
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns.slice(0, 6).map((column) => (
                    <TableCell key={column} className="max-w-xs truncate">
                      {formatValue(row[column], column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Badge variant="outline">
                Page {currentPage} of {totalPages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Report</h1>
            <p className="text-lg text-muted-foreground">
              View and analyze system data across different categories
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Reports
              </CardTitle>
              <CardDescription>
                Select a category to view detailed reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Section */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    What do you want to view?
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleFilter} disabled={loading || !selectedCategory}>
                  <Filter className="h-4 w-4 mr-2" />
                  {loading ? "Loading..." : "Filter"}
                </Button>
              </div>

              {/* Results Section */}
              {data.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {categories.find(c => c.value === selectedCategory)?.label} Data
                    </h3>
                    <Badge variant="secondary">
                      {totalRecords} total records
                    </Badge>
                  </div>
                  {renderTable()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Report;