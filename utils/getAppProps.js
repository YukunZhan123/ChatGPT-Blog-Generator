import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../lib/mongodb";

export const getAppProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res);
  const client = await clientPromise;
  const db = client.db("blog-generator");
  const user = await db.collection("users").findOne({
    auth0Id: userSession.user.sub,
  });

  if (!user) {
    return {
      availableTokens: 0,
      blogs: [],
    };
  }

  const blogs = await db
    .collection("blogs")
    .find({
      userId: user._id,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();

  return {
    availableTokens: user.availableTokens,
    blogs: blogs.map(({ createdAt, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      createdAt: createdAt.toString(),
      ...rest,
    })),
    blogId: ctx.params?.blogId || null,
  };
};
