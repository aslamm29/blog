import React from "react";
import "./Post.css";

export default function Post({ post }) {
  return (
    <div className="post">
      <div
        className="post-img"
        style={{ background: `url(${post.url})` }}
      ></div>
      <div className="details">
        <h4>{post.title}</h4>
      </div>
    </div>
  );
}
