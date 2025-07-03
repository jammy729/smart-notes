
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User, Download } from "lucide-react";

const RecentReports = () => {
  const recentReports = [
    {
      id: "1",
      patientName: "John Doe",
      reportType: "SOAP Note",
      createdAt: "2 hours ago",
      status: "completed",
      duration: "15:30"
    },
    {
      id: "2",
      patientName: "Jane Smith",
      reportType: "Consultation Note",
      createdAt: "4 hours ago",
      status: "completed",
      duration: "22:15"
    },
    {
      id: "3",
      patientName: "Mike Johnson",
      reportType: "Follow-up Email",
      createdAt: "1 day ago",
      status: "sent",
      duration: "8:45"
    },
    {
      id: "4",
      patientName: "Sarah Wilson",
      reportType: "SOAP Note",
      createdAt: "1 day ago",
      status: "draft",
      duration: "18:20"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Your latest medical documentation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{report.patientName}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{report.reportType}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{report.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getStatusBadge(report.status)}
                <span className="text-sm text-gray-500">{report.createdAt}</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="outline">View All Reports</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReports;
