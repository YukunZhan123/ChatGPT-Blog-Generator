import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import Markdown from "react-markdown";
import { useRouter } from "next/router";

export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [keyWords, setKeywords] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/generateBlog", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ topic, keyWords }),
    });
    const json = await response.json();
    if (json?.blogId) {
      router.push(`/post/${json.blogId}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <strong>Generate a blog on the topic of:</strong>
          </label>
          <textarea
            className="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label>
            <strong>Targeting the following keywords:</strong>
          </label>
          <textarea
            className="text"
            value={keyWords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
        <button type="submit" className="btn">
          generate
        </button>
      </form>
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired(() => {
  return {
    props: {},
  };
});
