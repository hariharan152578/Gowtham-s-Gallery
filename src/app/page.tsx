import connectMongo from "@/lib/db";
import { Portfolio } from "@/models/portfolio.model";
import { Gallery } from "@/models/gallery.model";
import GalleryClient from "@/components/GalleryClient";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  await connectMongo();

  // Fetch Portfolio
  const portfolioDoc = await Portfolio.findOne();
  const portfolio = portfolioDoc ? JSON.parse(JSON.stringify(portfolioDoc)) : null;

  // Fetch Gallery Images
  const galleryDocs = await Gallery.find().sort({ createdAt: -1 });
  const gallery = JSON.parse(JSON.stringify(galleryDocs));

  return (
    <main className="min-h-screen">
      <GalleryClient portfolio={portfolio} gallery={gallery} />
    </main>
  );
}
