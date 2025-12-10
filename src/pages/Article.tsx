import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Article content database
const articleContent: Record<string, {
  title: string;
  category: string;
  readTime: string;
  content: string[];
  relatedArticles: string[];
}> = {
  "pcos-basics": {
    title: "Understanding PCOS",
    category: "PCOS",
    readTime: "8 min read",
    content: [
      "Polycystic Ovary Syndrome (PCOS) is one of the most common hormonal disorders affecting women of reproductive age. It affects approximately 1 in 10 women worldwide, and studies suggest the prevalence may be even higher among African women.",
      "PCOS occurs when the ovaries produce higher than normal amounts of androgens (male hormones), which can interfere with the development and release of eggs during ovulation. This hormonal imbalance can lead to a variety of symptoms and health concerns.",
      "Common symptoms include irregular or missed periods, excess hair growth on the face and body (hirsutism), acne, weight gain, difficulty losing weight, darkening of the skin, and thinning hair on the scalp. Many women also experience difficulty getting pregnant due to irregular ovulation.",
      "The exact cause of PCOS is not fully understood, but factors include genetics, insulin resistance, and inflammation. If you have a family member with PCOS, you may be at higher risk of developing the condition.",
      "Diagnosis typically involves a physical exam, blood tests to check hormone levels, and an ultrasound to examine the ovaries. Your doctor will look for signs of elevated androgen levels and polycystic ovaries.",
      "Treatment options vary based on your symptoms and goals. Lifestyle changes like diet and exercise are often the first line of treatment. Medications may include birth control pills to regulate periods, metformin to improve insulin resistance, and other medications to address specific symptoms.",
      "Living with PCOS requires ongoing management, but many women successfully manage their symptoms and lead healthy, fulfilling lives. Regular check-ups with your healthcare provider are essential for monitoring and adjusting your treatment plan.",
    ],
    relatedArticles: ["fibroids-basics", "mental-health", "partner-communication"],
  },
  "fibroids-basics": {
    title: "Understanding Fibroids",
    category: "Fibroids",
    readTime: "10 min read",
    content: [
      "Uterine fibroids are non-cancerous growths that develop in or around the uterus. They are made of muscle and fibrous tissue and can vary greatly in size—from as small as a seed to as large as a melon.",
      "Fibroids are extremely common, affecting up to 80% of women by age 50. African women are particularly affected, often developing fibroids at younger ages and experiencing more severe symptoms than women of other ethnic backgrounds.",
      "Many women with fibroids have no symptoms at all. However, when symptoms do occur, they may include heavy or prolonged menstrual bleeding, pelvic pain or pressure, frequent urination, difficulty emptying the bladder, constipation, and backache or leg pains.",
      "The exact cause of fibroids is unknown, but they are linked to estrogen levels. Fibroids tend to grow during reproductive years when estrogen levels are highest and often shrink after menopause when estrogen levels decline.",
      "Risk factors include age (most common in women in their 30s and 40s), family history, African ancestry, obesity, diet high in red meat, and vitamin D deficiency. Starting your period at a young age may also increase your risk.",
      "Diagnosis is usually made through a pelvic exam, ultrasound, or MRI. Your doctor may also recommend blood tests to check for anemia if you have heavy bleeding.",
      "Treatment depends on the size, number, and location of fibroids, as well as your symptoms and desire for future pregnancy. Options range from watchful waiting to medications, minimally invasive procedures, and surgery.",
      "Many women successfully manage fibroids through lifestyle changes and medical treatment. It's important to work with a healthcare provider who understands your specific situation and can help you make informed decisions about your care.",
    ],
    relatedArticles: ["pcos-basics", "mental-health", "partner-communication"],
  },
  "mental-health": {
    title: "Managing Stress & Mental Health",
    category: "Wellness",
    readTime: "7 min read",
    content: [
      "Living with a reproductive health condition like PCOS or fibroids can take a significant toll on your mental health. The physical symptoms, fertility concerns, and ongoing management can lead to stress, anxiety, and depression.",
      "Research shows that women with PCOS are at higher risk of anxiety and depression. The hormonal imbalances associated with PCOS can directly affect mood, and the visible symptoms like acne and weight gain can impact self-esteem and body image.",
      "Similarly, women with fibroids may experience anxiety about their condition, especially if they're dealing with severe symptoms or facing decisions about treatment. The unpredictability of symptoms can also contribute to feelings of stress and loss of control.",
      "It's important to recognize that these feelings are valid and common. You are not alone in experiencing emotional challenges alongside your physical symptoms. Seeking support is a sign of strength, not weakness.",
      "Strategies for managing stress include regular physical activity, which can help regulate hormones and improve mood. Even gentle exercise like walking, swimming, or yoga can make a difference. Mindfulness and meditation practices can help reduce anxiety and improve emotional well-being.",
      "Building a support network is crucial. This might include friends and family, support groups (online or in-person), and mental health professionals. Talking about your experiences with others who understand can be incredibly healing.",
      "Don't hesitate to seek professional help if you're struggling. A therapist or counselor can provide coping strategies and a safe space to process your emotions. In some cases, medication may be helpful and is nothing to be ashamed of.",
      "Remember that taking care of your mental health is just as important as managing your physical symptoms. A holistic approach to your health will help you feel better overall and improve your quality of life.",
    ],
    relatedArticles: ["pcos-basics", "fibroids-basics", "partner-communication"],
  },
  "partner-communication": {
    title: "Talking to Your Partner",
    category: "Relationships",
    readTime: "6 min read",
    content: [
      "Having a reproductive health condition can affect your relationships, particularly your intimate partnerships. Open and honest communication with your partner is essential for maintaining a healthy relationship while managing your health.",
      "Many women feel hesitant to discuss their condition with their partners, fearing they won't understand or will see them differently. However, keeping your partner informed can actually strengthen your relationship and help them support you better.",
      "Start by educating yourself about your condition so you can explain it clearly. Choose a calm, private moment to have the conversation—not during an argument or when either of you is stressed. Be honest about your symptoms, how they affect you, and what kind of support you need.",
      "Your partner may have questions or concerns, especially about fertility or intimacy. Be patient and give them time to process the information. Provide resources they can read to learn more, and consider inviting them to a doctor's appointment with you.",
      "Discuss how your condition affects your daily life and what accommodations might help. This might include understanding when you need rest, being patient during symptom flare-ups, or adjusting plans when necessary.",
      "If intimacy is affected by your symptoms, communicate openly about this too. Many couples find that honest conversations about these challenges actually bring them closer together and help them find solutions that work for both partners.",
      "Remember that a supportive partner can make a significant difference in managing a chronic health condition. If your partner is not supportive, consider seeking couples counseling to work on communication and understanding.",
    ],
    relatedArticles: ["mental-health", "pcos-basics", "fibroids-basics"],
  },
};

const Article = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();

  const article = articleId ? articleContent[articleId] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/learn")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
        </Card>
      </div>
    );
  }

  const relatedArticles = article.relatedArticles
    .map((id) => articleContent[id] ? { id, ...articleContent[id] } : null)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/learn")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Article</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">{article.category}</Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{article.readTime}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.content.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid gap-4">
                {relatedArticles.map((related) => related && (
                  <Card 
                    key={related.id} 
                    className="p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/article/${related.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{related.category}</Badge>
                          <span className="text-xs text-muted-foreground">{related.readTime}</span>
                        </div>
                        <h3 className="font-semibold">{related.title}</h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <Button variant="outline" onClick={() => navigate("/learn")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Resources
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Article;
