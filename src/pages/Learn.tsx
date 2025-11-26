import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft, BookOpen } from "lucide-react";

const articles = [
  {
    id: "pcos-basics",
    title: "Understanding PCOS",
    category: "PCOS",
    summary:
      "Learn about Polycystic Ovary Syndrome, its causes, symptoms, and how it affects women across Africa.",
    content: `
Polycystic Ovary Syndrome (PCOS) is one of the most common hormonal disorders affecting women of reproductive age. 
It's characterized by irregular periods, excess androgen levels, and polycystic ovaries.

**Common Symptoms:**
- Irregular or absent menstrual periods
- Excess hair growth on face, chest, or back
- Acne and oily skin
- Weight gain and difficulty losing weight
- Thinning hair on the scalp
- Difficulty getting pregnant

**What Causes PCOS?**
The exact cause isn't fully understood, but factors include:
- Insulin resistance
- Hormonal imbalances
- Genetic factors
- Inflammation

**Living with PCOS**
While PCOS is a chronic condition, it can be managed effectively with:
- Healthy lifestyle changes (diet and exercise)
- Medications to regulate periods and manage symptoms
- Support from healthcare providers
- Stress management techniques

Remember: You're not alone. PCOS affects millions of women worldwide, and with proper support and treatment, 
you can manage your symptoms and live a healthy, fulfilling life.
    `,
  },
  {
    id: "fibroids-basics",
    title: "Understanding Fibroids",
    category: "Fibroids",
    summary:
      "What are uterine fibroids, who gets them, and what treatment options are available?",
    content: `
Uterine fibroids are non-cancerous growths that develop in or around the uterus. They're incredibly common, 
with up to 80% of women developing them by age 50. Black women, including African women, are more likely 
to develop fibroids and at younger ages.

**Types of Fibroids:**
- Intramural (within the uterine wall)
- Subserosal (outside the uterus)
- Submucosal (inside the uterine cavity)
- Pedunculated (attached by a stalk)

**Symptoms:**
Many women with fibroids have no symptoms, but when present, they may include:
- Heavy or prolonged menstrual bleeding
- Pelvic pain or pressure
- Frequent urination
- Difficulty emptying the bladder
- Constipation
- Back or leg pain

**Treatment Options:**
Treatment depends on the size, location, and symptoms:
- Watchful waiting for small, asymptomatic fibroids
- Medications to regulate hormones and reduce bleeding
- Minimally invasive procedures
- Surgical options for severe cases

**When to See a Doctor:**
Consult a healthcare provider if you experience:
- Very heavy or prolonged periods
- Severe pelvic pain
- Difficulty with urination or bowel movements
- Infertility issues

With proper medical care, fibroids can be managed effectively, allowing you to maintain your quality of life.
    `,
  },
  {
    id: "mental-health",
    title: "Managing Stress & Mental Health",
    category: "Wellness",
    summary:
      "The connection between reproductive health conditions and mental well-being, and strategies for coping.",
    content: `
Living with chronic health conditions like PCOS or fibroids can take a toll on your mental health. 
You may experience anxiety, depression, or feelings of isolation. This is completely normal and valid.

**The Mind-Body Connection:**
- Chronic pain can lead to emotional distress
- Hormonal imbalances affect mood and emotions
- Concerns about fertility can cause anxiety
- Body image issues may impact self-esteem

**Coping Strategies:**
1. **Talk About It:** Share your feelings with trusted friends, family, or a mental health professional
2. **Join a Support Group:** Connect with other women who understand what you're going through
3. **Practice Self-Care:** Prioritize activities that bring you joy and relaxation
4. **Stay Active:** Regular exercise can improve mood and reduce stress
5. **Mindfulness & Meditation:** These practices can help manage anxiety and pain
6. **Set Realistic Goals:** Break tasks into manageable steps

**Addressing Stigma:**
In many African communities, there's stigma around both reproductive health issues and mental health. 
Remember:
- Your health challenges don't define your worth
- Seeking help is a sign of strength, not weakness
- You deserve compassionate, judgment-free care
- Many women share similar experiences

**When to Seek Professional Help:**
If you're experiencing:
- Persistent sadness or hopelessness
- Loss of interest in activities you once enjoyed
- Changes in sleep or appetite
- Thoughts of self-harm

Please reach out to a mental health professional or use NauriCare to connect with supportive healthcare providers.
    `,
  },
  {
    id: "partner-communication",
    title: "Talking to Your Partner",
    category: "Relationships",
    summary:
      "How to communicate about your health challenges with your partner and maintain a healthy relationship.",
    content: `
Discussing reproductive health issues with your partner can feel uncomfortable, but open communication 
is essential for a healthy, supportive relationship.

**Starting the Conversation:**
- Choose a calm, private moment
- Be honest about your symptoms and concerns
- Explain how your condition affects you physically and emotionally
- Share information about your diagnosis

**What Your Partner Should Know:**
- Your symptoms are real and not "all in your head"
- Some days will be harder than others
- Certain activities or positions might be painful
- Fertility concerns are valid and worth discussing
- You may need extra support during difficult times

**Managing Intimacy:**
- Communicate about pain or discomfort during sex
- Explore alternative ways to maintain intimacy
- Be patient with each other
- Consider couples counseling if needed

**Building Support:**
- Invite your partner to medical appointments
- Share educational resources
- Discuss treatment options together
- Set mutual goals for managing your condition

**Dealing with Insensitivity:**
If your partner doesn't understand or dismisses your concerns:
- Clearly explain the impact on your daily life
- Share reputable information sources
- Consider involving a healthcare provider
- Evaluate whether the relationship is healthy for you

Remember: You deserve a partner who respects your health needs and supports you through challenges.
    `,
  },
];

const Learn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Learn & Community</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Knowledge is Power</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn about PCOS, fibroids, and reproductive health in a safe, judgment-free space.
            </p>
          </div>

          <div className="grid gap-6 mb-12">
            {articles.map((article) => (
              <Card key={article.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{article.title}</h3>
                    <p className="text-sm text-primary font-medium">{article.category}</p>
                  </div>
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">{article.summary}</p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/learn/${article.id}`, { state: { article } })}
                >
                  Read More
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Community Support (Coming Soon)</h3>
                <p className="text-muted-foreground mb-4">
                  We're building a safe, moderated community where women can share experiences, ask questions, 
                  and support each other through their health journeys. Stay tuned for updates!
                </p>
                <p className="text-sm text-muted-foreground">
                  In the meantime, connect with verified healthcare providers through our specialist directory.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Learn;
