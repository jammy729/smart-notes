
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Send, Copy, Wand2 } from "lucide-react";

const ReportGenerator = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  const reportTypes = [
    { value: "consultation", label: "Consultation Note" },
    { value: "soap", label: "SOAP Note" },
    { value: "followup", label: "Follow-up Email" },
    { value: "discharge", label: "Discharge Summary" },
  ];

  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const sampleContent = getSampleContent(selectedReport);
      setGeneratedContent(sampleContent);
      setIsGenerating(false);
    }, 3000);
  };

  const getSampleContent = (type: string) => {
    switch (type) {
      case "consultation":
        return `CONSULTATION NOTE

Date: ${new Date().toLocaleDateString()}
Patient: John Doe
DOB: 01/15/1980

CHIEF COMPLAINT:
Patient presents with chest pain and shortness of breath.

HISTORY OF PRESENT ILLNESS:
45-year-old male reports onset of chest pain 2 days ago, described as sharp, intermittent, worsening with deep inspiration. Associated with mild shortness of breath on exertion.

PHYSICAL EXAMINATION:
- Vital Signs: BP 130/85, HR 78, RR 16, Temp 98.6°F
- General: Alert, oriented, in no acute distress
- Cardiovascular: Regular rate and rhythm, no murmurs
- Respiratory: Clear to auscultation bilaterally

ASSESSMENT AND PLAN:
Likely musculoskeletal chest pain. Recommend NSAIDs, rest, and follow-up if symptoms persist.`;

      case "soap":
        return `SOAP NOTE

SUBJECTIVE:
Patient reports chest pain for 2 days, sharp and intermittent, worse with inspiration. Denies fever, palpitations, or syncope.

OBJECTIVE:
- Vitals: BP 130/85, HR 78, RR 16, T 98.6°F
- Physical exam notable for chest wall tenderness
- No cardiac murmurs or irregular rhythms

ASSESSMENT:
Musculoskeletal chest pain, likely costochondritis

PLAN:
1. NSAIDs for pain management
2. Rest and activity modification
3. Return if symptoms worsen or persist beyond 1 week`;

      case "followup":
        return `Subject: Follow-up Instructions - Chest Pain Consultation

Dear John,

Thank you for your visit today regarding your chest pain concerns.

Based on our evaluation, your symptoms appear to be related to musculoskeletal causes, likely costochondritis.

RECOMMENDATIONS:
• Take ibuprofen 400mg every 6-8 hours with food
• Apply ice packs for 15-20 minutes several times daily
• Avoid strenuous activities for the next few days

FOLLOW-UP:
Please contact our office if:
- Pain worsens or becomes severe
- You develop shortness of breath at rest
- You experience palpitations or dizziness

If symptoms persist beyond one week, please schedule a follow-up appointment.

Best regards,
Dr. Smith`;

      default:
        return "Please select a report type to generate content.";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Generator
          </CardTitle>
          <CardDescription>Generate AI-powered medical reports from your recordings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Recording Session</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recording" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session1">Today 2:30 PM - John Doe</SelectItem>
                  <SelectItem value="session2">Today 1:15 PM - Jane Smith</SelectItem>
                  <SelectItem value="session3">Yesterday 4:45 PM - Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={!selectedReport || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Generated Report</CardTitle>
                <CardDescription>AI-generated medical documentation</CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Ready for Review
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white border rounded-lg p-6 min-h-[400px] font-mono text-sm whitespace-pre-line">
              {generatedContent}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button size="sm">
                Save to EMR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportGenerator;
