import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
export default function Post(props) {
  console.log(props);
  return <div>This is the post page.</div>;
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("blog-generator");
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub,
    });
    const blog = await db.collection("blogs").findOne({
      _id: new ObjectId(ctx.params.postId),
      userId: user._id,
    });

    if (!blog) {
      return {
        redirect: {
          destination: "post/new",
          permanent: false,
        },
      };
    }
    return {
      props: {
        blogContent: blog.blogContent,
        title: blog.title,
        metaDescription: blog.metaDescription,
        keyWords: blog.keyWords,
      },
    };
  },
});
