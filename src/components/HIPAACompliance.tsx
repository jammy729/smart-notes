
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Database, Server, FileText } from "lucide-react";

const HIPAACompliance = () => {
  const complianceFeatures = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: "End-to-End Encryption",
      description: "All patient data is encrypted in transit and at rest using AES-256 encryption"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Secure Database",
      description: "Patient records stored in HIPAA-compliant Supabase infrastructure with Row Level Security"
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Access Controls",
      description: "Role-based access controls ensure only authorized personnel can view patient data"
    },
    {
      icon: <Server className="w-5 h-5" />,
      title: "Secure API Processing",
      description: "AI processing through secure channels with no permanent storage of API keys"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Audit Logging",
      description: "Comprehensive logging of all data access and modifications for compliance"
    }
  ];

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-800">HIPAA Compliance</CardTitle>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Compliant
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          AlphaScript.ai is designed with HIPAA compliance at its core
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="text-green-600 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">{feature.title}</h4>
                <p className="text-sm text-green-700">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <strong>Important:</strong> While AlphaScript.ai implements strong security measures, 
            healthcare organizations should conduct their own security assessments and ensure 
            compliance with all applicable regulations in their jurisdiction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HIPAACompliance;
