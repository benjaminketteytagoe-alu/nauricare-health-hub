import { jsPDF } from "jspdf";

interface PDFContent {
  title: string;
  subtitle?: string;
  sections: {
    heading: string;
    content: string[];
  }[];
}

const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Brand header
  doc.setFillColor(244, 114, 106); // Primary coral color
  doc.rect(0, 0, 210, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 20);
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 20, 28);
  }
  
  // NauriCare branding
  doc.setFontSize(10);
  doc.text("NauriCare", 180, 15);
  doc.setFontSize(8);
  doc.text("Women's Health Platform", 165, 22);
};

const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text(`Page ${pageNumber}`, 100, pageHeight - 10, { align: "center" });
  doc.text("© NauriCare - Empowering Women's Health Across Africa", 100, pageHeight - 5, { align: "center" });
};

export const generatePDF = (content: PDFContent): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 50;
  let pageNumber = 1;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;
  
  addHeader(doc, content.title, content.subtitle);
  
  content.sections.forEach((section) => {
    // Check if we need a new page for the heading
    if (yPosition > pageHeight - 40) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      yPosition = 30;
    }
    
    // Section heading
    doc.setTextColor(244, 114, 106);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(section.heading, margin, yPosition);
    yPosition += lineHeight + 3;
    
    // Section content
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    section.content.forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph, 170);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 25) {
          addFooter(doc, pageNumber);
          doc.addPage();
          pageNumber++;
          yPosition = 30;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 3; // Extra space between paragraphs
    });
    
    yPosition += 5; // Extra space between sections
  });
  
  addFooter(doc, pageNumber);
  
  return doc;
};

// Material content definitions
export const materialContents: Record<string, PDFContent> = {
  "pcos-guide": {
    title: "Complete PCOS Management Guide",
    subtitle: "Your comprehensive resource for understanding and managing PCOS",
    sections: [
      {
        heading: "What is PCOS?",
        content: [
          "Polycystic Ovary Syndrome (PCOS) is a common hormonal disorder affecting women of reproductive age. It affects approximately 1 in 10 women worldwide, with prevalence rates particularly high in African women.",
          "PCOS occurs when the ovaries produce abnormal amounts of androgens (male sex hormones) that are usually present in women in small amounts. The condition gets its name from the numerous small cysts that form in the ovaries."
        ]
      },
      {
        heading: "Common Symptoms",
        content: [
          "• Irregular or absent menstrual periods",
          "• Heavy bleeding during periods",
          "• Excess hair growth on face, chest, and back (hirsutism)",
          "• Acne and oily skin",
          "• Weight gain or difficulty losing weight",
          "• Thinning hair on the scalp",
          "• Darkening of skin in body folds",
          "• Skin tags in armpits or neck area",
          "• Difficulty getting pregnant"
        ]
      },
      {
        heading: "Lifestyle Management",
        content: [
          "Diet plays a crucial role in managing PCOS symptoms. Focus on low-glycemic foods that don't spike blood sugar levels. Include plenty of vegetables, lean proteins, and whole grains in your diet.",
          "Regular physical activity helps improve insulin sensitivity and can help with weight management. Aim for at least 150 minutes of moderate exercise per week.",
          "Stress management is essential as high cortisol levels can worsen PCOS symptoms. Consider practices like meditation, yoga, or deep breathing exercises."
        ]
      },
      {
        heading: "Medical Treatment Options",
        content: [
          "Birth control pills: Help regulate menstrual cycles and reduce androgen levels.",
          "Metformin: Improves insulin sensitivity and may help with weight loss.",
          "Anti-androgen medications: Can reduce excess hair growth and acne.",
          "Fertility treatments: Options available for those trying to conceive.",
          "Always consult with a healthcare provider before starting any treatment. Every woman's PCOS is different, and treatment should be personalized to your specific needs."
        ]
      },
      {
        heading: "When to Seek Help",
        content: [
          "Contact a healthcare provider if you experience irregular periods, difficulty getting pregnant, signs of excess androgen (hirsutism, acne), or unexplained weight gain.",
          "Early diagnosis and treatment can help manage symptoms and prevent long-term health complications such as type 2 diabetes, heart disease, and endometrial cancer."
        ]
      }
    ]
  },
  "meal-plan": {
    title: "7-Day Hormone-Balancing Meal Plan",
    subtitle: "African-inspired recipes for hormonal health",
    sections: [
      {
        heading: "Introduction",
        content: [
          "This meal plan is designed specifically for women managing PCOS and fibroids. The recipes feature low-glycemic ingredients and anti-inflammatory foods common in African cuisine.",
          "Key principles: Focus on whole foods, limit processed sugars, include plenty of fiber, and incorporate healthy fats."
        ]
      },
      {
        heading: "Day 1",
        content: [
          "Breakfast: Millet porridge with cinnamon, nuts, and fresh papaya",
          "Lunch: Grilled fish with sukuma wiki (collard greens) and brown ugali",
          "Dinner: Chicken vegetable stew with sweet potatoes",
          "Snack: Handful of groundnuts and sliced mango"
        ]
      },
      {
        heading: "Day 2",
        content: [
          "Breakfast: Scrambled eggs with tomatoes and spinach",
          "Lunch: Bean and vegetable soup with millet bread",
          "Dinner: Grilled tilapia with cabbage salad and plantains",
          "Snack: Fresh coconut pieces and pineapple"
        ]
      },
      {
        heading: "Day 3",
        content: [
          "Breakfast: Overnight oats with chia seeds and banana",
          "Lunch: Lentil stew with brown rice",
          "Dinner: Chicken with okra and tomato sauce",
          "Snack: Avocado with lemon and salt"
        ]
      },
      {
        heading: "Day 4",
        content: [
          "Breakfast: Smoothie with spinach, banana, and groundnut butter",
          "Lunch: Grilled vegetables with quinoa",
          "Dinner: Fish curry with cauliflower rice",
          "Snack: Roasted chickpeas with spices"
        ]
      },
      {
        heading: "Day 5",
        content: [
          "Breakfast: Sweet potato hash with eggs",
          "Lunch: Chicken salad with avocado dressing",
          "Dinner: Beef and vegetable stew with millet",
          "Snack: Fresh fruit with coconut yogurt"
        ]
      },
      {
        heading: "Day 6",
        content: [
          "Breakfast: Amaranth porridge with berries and honey",
          "Lunch: Stuffed bell peppers with beans and rice",
          "Dinner: Grilled chicken with roasted vegetables",
          "Snack: Cucumber and carrot sticks with hummus"
        ]
      },
      {
        heading: "Day 7",
        content: [
          "Breakfast: Veggie omelette with whole grain toast",
          "Lunch: Coconut fish soup with vegetables",
          "Dinner: Turkey meatballs with zucchini noodles",
          "Snack: Mixed nuts and dried fruits"
        ]
      },
      {
        heading: "Meal Prep Tips",
        content: [
          "• Prepare grains and proteins in batches at the start of the week",
          "• Wash and chop vegetables ahead of time for easy cooking",
          "• Keep healthy snacks readily available to avoid reaching for processed foods",
          "• Stay hydrated - aim for 8 glasses of water daily"
        ]
      }
    ]
  },
  "symptom-diary": {
    title: "Symptom Tracking Diary",
    subtitle: "Monitor your health patterns effectively",
    sections: [
      {
        heading: "How to Use This Diary",
        content: [
          "Tracking your symptoms daily helps identify patterns and triggers. This information is invaluable for your healthcare provider in tailoring treatment to your needs.",
          "Try to record symptoms at the same time each day for consistency. Be honest and thorough - no symptom is too small to note."
        ]
      },
      {
        heading: "Daily Tracking Categories",
        content: [
          "Physical Symptoms: Pain levels (1-10), bloating, fatigue, headaches, breast tenderness",
          "Menstrual Cycle: Flow intensity, spotting, cycle day",
          "Mood: Anxiety, depression, irritability, motivation levels",
          "Sleep: Hours slept, quality rating, any disturbances",
          "Energy: Overall energy level throughout the day",
          "Diet: What you ate, any trigger foods identified",
          "Exercise: Type and duration of physical activity"
        ]
      },
      {
        heading: "Weekly Reflection Questions",
        content: [
          "• What symptoms were most prominent this week?",
          "• Did you notice any patterns or triggers?",
          "• How did your symptoms affect your daily activities?",
          "• What strategies helped manage your symptoms?",
          "• What would you like to discuss with your healthcare provider?"
        ]
      },
      {
        heading: "Monthly Summary Template",
        content: [
          "Cycle length: ___ days",
          "Average pain level: ___/10",
          "Days with symptoms: ___",
          "Symptom-free days: ___",
          "Most challenging symptom: ___",
          "Most effective management strategy: ___",
          "Goals for next month: ___"
        ]
      },
      {
        heading: "Notes Section",
        content: [
          "Use this space to record any additional observations, questions for your doctor, or personal reflections on your health journey.",
          "Remember: You are your own best health advocate. The more information you gather, the better equipped you and your healthcare team will be to manage your condition."
        ]
      }
    ]
  },
  "questions-doctor": {
    title: "Questions to Ask Your Doctor",
    subtitle: "Make the most of your specialist consultations",
    sections: [
      {
        heading: "Before Your Appointment",
        content: [
          "Prepare a summary of your symptoms, including when they started and how severe they are.",
          "Bring your symptom tracking diary if you have one.",
          "List all medications and supplements you're currently taking.",
          "Write down your questions in advance so you don't forget them during the appointment."
        ]
      },
      {
        heading: "Diagnosis Questions",
        content: [
          "• What condition do I have, and how was it diagnosed?",
          "• Are there any additional tests I should have?",
          "• What caused this condition?",
          "• Is this condition hereditary? Should my family members be screened?",
          "• How will this condition affect my daily life?",
          "• Will this affect my ability to have children?"
        ]
      },
      {
        heading: "Treatment Questions",
        content: [
          "• What are my treatment options?",
          "• What are the benefits and risks of each option?",
          "• Which treatment do you recommend for me and why?",
          "• How long will treatment take?",
          "• What side effects should I expect?",
          "• Are there lifestyle changes that could help?",
          "• When should I expect to see improvement?"
        ]
      },
      {
        heading: "Follow-up Questions",
        content: [
          "• How often should I schedule check-ups?",
          "• What symptoms should prompt me to call immediately?",
          "• Are there support groups or resources you recommend?",
          "• Can I get a summary of today's visit in writing?",
          "• Who should I contact if I have questions between appointments?"
        ]
      },
      {
        heading: "Tips for the Appointment",
        content: [
          "• Bring a friend or family member for support and to help remember information",
          "• Take notes during the appointment",
          "• Don't be afraid to ask for clarification if you don't understand something",
          "• Ask for written materials or reliable websites for more information",
          "• Request copies of any test results for your records"
        ]
      }
    ]
  },
  "exercise-guide": {
    title: "Gentle Exercise Guide",
    subtitle: "Safe exercises for PCOS & Fibroids",
    sections: [
      {
        heading: "Exercise Benefits",
        content: [
          "Regular physical activity can help manage symptoms of PCOS and fibroids by improving insulin sensitivity, reducing inflammation, managing weight, and boosting mood.",
          "The key is to find activities you enjoy and can maintain consistently. Start slowly and gradually increase intensity as your fitness improves."
        ]
      },
      {
        heading: "Recommended Activities",
        content: [
          "Walking: Start with 15-20 minutes daily and work up to 30-45 minutes",
          "Swimming: Excellent low-impact option that's easy on joints",
          "Yoga: Helps reduce stress and improve flexibility",
          "Cycling: Great for cardiovascular health without high impact",
          "Pilates: Strengthens core muscles and improves posture",
          "Light strength training: Builds muscle and boosts metabolism"
        ]
      },
      {
        heading: "Sample Weekly Schedule",
        content: [
          "Monday: 30-minute walk + 10 minutes stretching",
          "Tuesday: 20-minute yoga session",
          "Wednesday: Rest or gentle stretching",
          "Thursday: 30-minute swim or water aerobics",
          "Friday: 20-minute Pilates",
          "Saturday: 45-minute leisurely bike ride or walk",
          "Sunday: Rest and recovery"
        ]
      },
      {
        heading: "Exercises to Approach with Caution",
        content: [
          "High-intensity interval training (HIIT) - may worsen hormonal imbalances if overdone",
          "Heavy lifting - especially during heavy menstrual periods",
          "High-impact exercises - jumping, running if experiencing pelvic pain",
          "Core exercises that strain the abdomen - especially with large fibroids",
          "Always listen to your body and stop if you experience pain or discomfort."
        ]
      },
      {
        heading: "Important Reminders",
        content: [
          "• Consult your healthcare provider before starting any new exercise program",
          "• Stay hydrated before, during, and after exercise",
          "• Wear comfortable, supportive clothing",
          "• Avoid exercising on an empty stomach or right after eating",
          "• Track how different exercises affect your symptoms",
          "• Rest during severe symptoms or heavy menstrual days"
        ]
      }
    ]
  },
  "fibroid-factsheet": {
    title: "Fibroid Facts",
    subtitle: "What every woman needs to know",
    sections: [
      {
        heading: "What Are Fibroids?",
        content: [
          "Uterine fibroids are non-cancerous growths that develop in or on the uterus. They're extremely common - up to 80% of women develop fibroids by age 50, with African women at higher risk.",
          "Fibroids can range in size from tiny seedlings to large masses that can distort the uterus. Many women have fibroids without knowing it."
        ]
      },
      {
        heading: "Types of Fibroids",
        content: [
          "Intramural: Grow within the muscular uterine wall (most common)",
          "Submucosal: Bulge into the uterine cavity",
          "Subserosal: Project to the outside of the uterus",
          "Pedunculated: Grow on a stalk inside or outside the uterus"
        ]
      },
      {
        heading: "Common Symptoms",
        content: [
          "• Heavy or prolonged menstrual bleeding",
          "• Pelvic pain or pressure",
          "• Frequent urination",
          "• Difficulty emptying the bladder",
          "• Constipation",
          "• Backache or leg pain",
          "• Enlarged abdomen"
        ]
      },
      {
        heading: "Risk Factors",
        content: [
          "• African ancestry (2-3 times higher risk)",
          "• Family history of fibroids",
          "• Age (most common in 30s-40s)",
          "• Obesity",
          "• Early onset of menstruation",
          "• Diet high in red meat, low in vegetables",
          "• Vitamin D deficiency"
        ]
      },
      {
        heading: "Treatment Options",
        content: [
          "Watchful waiting: For small fibroids without symptoms",
          "Medications: To manage symptoms and slow growth",
          "Minimally invasive procedures: Uterine artery embolization, focused ultrasound",
          "Surgical options: Myomectomy (fibroid removal), hysterectomy",
          "Treatment depends on symptoms, fibroid size and location, age, and pregnancy plans."
        ]
      },
      {
        heading: "When to Seek Help",
        content: [
          "See a healthcare provider if you experience heavy bleeding, pelvic pain, difficulty urinating or emptying bladder, or unexplained anemia.",
          "Regular check-ups are important to monitor fibroid growth and adjust treatment as needed."
        ]
      }
    ]
  }
};

export const downloadMaterialPDF = (materialId: string, title: string) => {
  const content = materialContents[materialId];
  if (!content) {
    console.error("Material content not found:", materialId);
    return;
  }
  
  const doc = generatePDF(content);
  const filename = `NauriCare_${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
};
