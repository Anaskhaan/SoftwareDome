import prisma from "@/lib/prisma";
import assert from "node:assert/strict";

async function main() {
  const user = await prisma.user.findFirst();
  assert.ok(user, "No user found in the database — run scripts/create-admin.ts first.");

  const blog = await prisma.blog.create({
    data: {
      title: "Comment Schema Probe",
      slug: `comment-schema-probe-${Date.now()}`,
      content: "<p>probe</p>",
      status: "DRAFT",
      authorId: user!.id,
    },
  });

  await prisma.comment.create({
    data: { content: "First probe comment", userId: user!.id, blogId: blog.id },
  });
  await prisma.comment.create({
    data: { content: "Second probe comment", userId: user!.id, blogId: blog.id },
  });

  const withRelations = await prisma.blog.findUnique({
    where: { id: blog.id },
    include: { comments: { include: { user: { select: { id: true, name: true } } } } },
  });

  assert.ok(withRelations, "Probe blog was not found after creation.");
  assert.equal(withRelations!.comments.length, 2, "Expected 2 comments on the probe blog.");
  assert.equal(withRelations!.comments[0].user.id, user!.id, "Comment.user relation did not resolve.");

  console.log("Comment relation check passed:", JSON.stringify(withRelations!.comments, null, 2));

  await prisma.comment.deleteMany({ where: { blogId: blog.id } });
  await prisma.blog.delete({ where: { id: blog.id } });

  const remaining = await prisma.comment.count({ where: { blogId: blog.id } });
  assert.equal(remaining, 0, "Comments were not cleaned up alongside their blog.");

  console.log("Cleanup verified. Comment model wiring works end-to-end.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
