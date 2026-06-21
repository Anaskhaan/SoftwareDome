import { createSoftware, updateSoftware, getSoftwareById, getSoftwareBySlug } from "@/app/dashboard/softwares/actions";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// 1x1 red pixel PNG
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUAcgFp7HUAAAAASUVORK5CYII=";

function makeTestFile(name: string): File {
  const buf = Buffer.from(PNG_BASE64, "base64");
  return new File([buf], name, { type: "image/png" });
}

async function main() {
  console.log("=== STEP 1: createSoftware ===");
  const createFd = new FormData();
  createFd.set("name", "Test Software QA Probe");
  createFd.set("website", "https://example.com");
  createFd.set("category", "EHR/EMR");
  createFd.set("introduction", "Test introduction");
  createFd.set("ourVerdict", "Test verdict");
  createFd.set("rating", "4.5");
  createFd.set("reportUrl", "https://example.com/report");
  createFd.set("howItWorks", "Test how it works");
  createFd.set("whoIsItFor", "Test audience");
  createFd.set("howItIsDifferent", "Test differentiation");
  createFd.set("sentiments", "Test sentiment");
  createFd.set("keyTakeaways", JSON.stringify(["Takeaway 1", "Takeaway 2"]));
  createFd.set("pros", JSON.stringify(["Pro 1", "Pro 2"]));
  createFd.set("cons", JSON.stringify(["Con 1"]));
  createFd.set("specifications", JSON.stringify({ Platform: "Web" }));
  createFd.set("faqs", JSON.stringify([{ question: "Q1?", answer: "A1." }]));
  createFd.set("logo", makeTestFile("logo.png"));
  createFd.append("pictures", makeTestFile("pic1.png"));
  createFd.append("pictures", makeTestFile("pic2.png"));

  const createResult = await createSoftware(createFd);
  console.log(JSON.stringify(createResult, null, 2));

  if (!createResult.success || !createResult.data) {
    throw new Error("createSoftware failed, aborting test");
  }

  const id = createResult.data.id;

  console.log("\n=== STEP 2: duplicate slug rejection ===");
  const dupFd = new FormData();
  dupFd.set("name", "Test Software QA Probe");
  const dupResult = await createSoftware(dupFd);
  console.log(JSON.stringify(dupResult, null, 2));

  console.log("\n=== STEP 3: getSoftwareById ===");
  const fetched = await getSoftwareById(id);
  console.log(JSON.stringify(fetched, null, 2));

  console.log("\n=== STEP 4: getSoftwareBySlug ===");
  const fetchedBySlug = await getSoftwareBySlug(createResult.data.slug);
  console.log(JSON.stringify(fetchedBySlug, null, 2));

  console.log("\n=== STEP 5: updateSoftware (new logo, keep+add pictures) ===");
  const updateFd = new FormData();
  updateFd.set("name", "Test Software QA Probe Updated");
  updateFd.set("website", "https://example.com/updated");
  updateFd.set("category", "EHR/EMR");
  updateFd.set("introduction", "Updated introduction");
  updateFd.set("ourVerdict", "Updated verdict");
  updateFd.set("rating", "3.8");
  updateFd.set("reportUrl", "https://example.com/report-updated");
  updateFd.set("howItWorks", "Updated how it works");
  updateFd.set("whoIsItFor", "Updated audience");
  updateFd.set("howItIsDifferent", "Updated differentiation");
  updateFd.set("sentiments", "Updated sentiment");
  updateFd.set("keyTakeaways", JSON.stringify(["Updated takeaway"]));
  updateFd.set("pros", JSON.stringify(["Updated pro"]));
  updateFd.set("cons", JSON.stringify(["Updated con"]));
  updateFd.set("specifications", JSON.stringify({ Platform: "Web/Mobile" }));
  updateFd.set("faqs", JSON.stringify([{ question: "Q1 updated?", answer: "A1 updated." }]));
  updateFd.set("existingPictures", JSON.stringify(fetched.data!.pictures));
  updateFd.append("pictures", makeTestFile("pic3.png"));

  const updateResult = await updateSoftware(id, updateFd);
  console.log(JSON.stringify(updateResult, null, 2));

  if (updateResult.success && updateResult.data?.slug === "test-software-qa-probe") {
    throw new Error("SLUG BUG STILL PRESENT: slug did not regenerate after rename");
  }
  console.log("\nSlug correctly regenerated to:", updateResult.data?.slug);

  console.log("\n=== STEP 6: cleanup (delete DB row + Cloudinary assets) ===");
  const finalRecord = await prisma.software.findUnique({ where: { id } });
  const allUrls = [finalRecord?.logo, ...(finalRecord?.pictures || [])].filter(Boolean) as string[];
  for (const url of allUrls) {
    const publicId = url.split("/").slice(-2).join("/").replace(/\.[a-zA-Z]+$/, "");
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      console.log(`Destroyed ${publicId}:`, res.result);
    } catch (e) {
      console.log(`Failed to destroy ${publicId}:`, e);
    }
  }
  await prisma.software.delete({ where: { id } });
  console.log("Deleted DB row:", id);
}

main()
  .catch((e) => {
    console.error("TEST FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
