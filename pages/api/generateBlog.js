import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("blog-generator");

  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub,
  });

  if (!userProfile?.availableTokens) {
    res.status(403).json({ error: "Insufficient tokens or user not found" });
    return;
  }

  // Configuration setup for OpenAI API
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  try {
    const { keyWords, topic } = req.body;

    // First API call to generate blog content
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            "You are an SEO friendly blog post generator called BlogGenerator. You are designed to output markdown(limited to markdown types for the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, i, ul, li, ol) without frontmatter.",
        },
        {
          role: "user",
          content: `Generate a long and detailed SEO friendly blog post on the following topic delimited by triple hyphens:
            ---
            ${topic}
            ---
            Targeting the following comma separated keywords delimited by triple hyphens:
            ---
            ${keyWords}
            ---`,
        },
      ],
    });

    // Checking for empty or undefined responses
    if (!response.data.choices[0]?.message?.content) {
      throw new Error("Failed to generate blog content");
    }

    const blogContent = response.data.choices[0].message.content;

    // Second API call to generate SEO metadata
    const seoResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            "You are designed to output JSON. Do not include HTML tags in your output.",
        },
        {
          role: "user",
          content: `Generate an SEO friendly title and SEO friendly meta description for the following blog post delimited by triple hyphens:
            ---
            ${blogContent}
            ---
            The output JSON must be in the following format:
            {
                "title": "example title",
                "metaDescription": "example metaDescription"
            }`,
        },
      ],
    });

    if (!seoResponse.data.choices[0]?.message?.content) {
      throw new Error("Failed to generate SEO metadata");
    }

    // console.log(seoResponse.data.choices[0]?.message?.content);

    // Parsing JSON content from the API response
    const { title, metaDescription } =
      JSON.parse(seoResponse.data.choices[0].message.content) || {};

    await db.collection("users").updateOne(
      {
        auth0Id: user.sub,
      },
      {
        $inc: {
          availableTokens: -1,
        },
      }
    );

    const blog = await db.collection("blogs").insertOne({
      blogContent,
      title,
      metaDescription,
      topic,
      keyWords,
      userId: userProfile._id,
      createdAt: new Date(),
    });

    res.status(200).json({ blogId: blog.insertedId });
  } catch (error) {
    console.error("Error in processing the API calls:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});
