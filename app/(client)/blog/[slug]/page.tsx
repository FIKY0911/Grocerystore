import Container from "@/components/Container";
import React from "react";
import { getSingleBlog, getOthersBlog } from "@/sanity/queries";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft, ArrowRight, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

dayjs.extend(relativeTime);
dayjs.locale("id");

const SingleBlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const blog = await getSingleBlog(slug);
  const otherBlogs = await getOthersBlog(slug, 3);

  if (!blog) {
    return notFound();
  }

  // Calculate reading time (rough estimate: 200 words per minute)
  const calculateReadingTime = (body: any) => {
    if (!body) return 1;
    let wordCount = 0;
    body.forEach((block: any) => {
      if (block._type === "block" && block.children) {
        block.children.forEach((child: any) => {
          if (child.text) {
            wordCount += child.text.split(/\s+/).length;
          }
        });
      }
    });
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const readingTime = calculateReadingTime(blog?.body);

  // Function to render blog content
  const renderContent = (body: any) => {
    if (!body) return null;

    return body.map((block: any, index: number) => {
      // Handle text blocks
      if (block._type === "block") {
        const children = block.children?.map((child: any, childIndex: number) => {
          return <span key={childIndex}>{child.text}</span>;
        });

        // Handle different heading styles
        if (block.style === "h1") {
          return (
            <h1 key={index} className="text-4xl font-bold mt-8 mb-4">
              {children}
            </h1>
          );
        }
        if (block.style === "h2") {
          return (
            <h2 key={index} className="text-3xl font-bold mt-6 mb-3">
              {children}
            </h2>
          );
        }
        if (block.style === "h3") {
          return (
            <h3 key={index} className="text-2xl font-bold mt-5 mb-2">
              {children}
            </h3>
          );
        }
        if (block.style === "h4") {
          return (
            <h4 key={index} className="text-xl font-bold mt-4 mb-2">
              {children}
            </h4>
          );
        }
        if (block.style === "blockquote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-shop_dark_green pl-4 italic my-6 text-gray-600"
            >
              {children}
            </blockquote>
          );
        }

        // Normal paragraph
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4 text-lg">
            {children}
          </p>
        );
      }

      // Handle images
      if (block._type === "image") {
        return (
          <div key={index} className="my-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={urlFor(block).url()}
              alt={block.alt || "Blog image"}
              width={800}
              height={500}
              className="w-full h-auto"
            />
            {block.alt && (
              <p className="text-sm text-gray-500 text-center mt-2 px-4">
                {block.alt}
              </p>
            )}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="py-10 bg-gray-50">
      <Container>
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="outline" className="mb-6 -ml-4 hover:bg-shop_light_green/10 hover:text-shop_dark_green border-shop_dark_green/30">
            <ArrowLeft size={18} className="mr-2" />
            Kembali ke Blog
          </Button>
        </Link>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog?.blogcategories?.map((category, index) => (
              <Badge key={index} className="bg-shop_dark_green text-white">
                {category?.title}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
            {blog?.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b text-gray-600">
            {blog?.author && (
              <div className="flex items-center gap-3">
                {blog?.author?.image && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-shop_light_green">
                    <Image
                      src={urlFor(blog?.author?.image).url()}
                      alt={blog?.author?.name || "Author"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 text-sm">
                    <User size={14} />
                    <span className="font-semibold text-gray-900">
                      {blog?.author?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>
                      {dayjs(blog?.publishedAt).format("D MMMM YYYY")}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reading Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} />
              <span>{readingTime} menit baca</span>
            </div>
          </div>

          {/* Featured Image */}
          {blog?.mainImage && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-10 shadow-xl">
              <Image
                src={urlFor(blog?.mainImage).url()}
                alt={blog?.title || "Blog image"}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {blog?.body && renderContent(blog.body)}
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Bagikan Artikel</h3>
                <p className="text-gray-600 text-sm">
                  Bagikan artikel ini kepada teman dan keluarga Anda
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: blog?.title || '',
                        url: window.location.href,
                      });
                    }
                  }}
                  className="gap-2 bg-shop_dark_green text-white hover:bg-shop_dark_green/90"
                >
                  <Share2 size={16} />
                  Bagikan
                </Button>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          {blog?.author && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Tentang Penulis</h3>
              <div className="flex gap-4">
                {blog?.author?.image && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={urlFor(blog?.author?.image).url()}
                      alt={blog?.author?.name || "Author"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {blog?.author?.name}
                  </h4>
                  {blog?.author?.bio && blog?.author?.bio[0]?.children?.[0]?.text && (
                    <p className="text-sm text-gray-600">
                      {blog?.author?.bio[0]?.children?.[0]?.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Related Articles */}
        {otherBlogs && otherBlogs.length > 0 && (
          <div className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Artikel Lainnya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherBlogs.map((relatedBlog) => (
                <Card
                  key={relatedBlog?.slug?.current}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white"
                >
                  {relatedBlog?.mainImage && (
                    <Link
                      href={`/blog/${relatedBlog?.slug?.current}`}
                      className="relative h-48 block overflow-hidden"
                    >
                      <Image
                        src={urlFor(relatedBlog?.mainImage).url()}
                        alt={relatedBlog?.title || "Blog image"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                      <Calendar size={12} />
                      <span>
                        {dayjs(relatedBlog?.publishedAt).format("D MMM YYYY")}
                      </span>
                    </div>
                    <Link href={`/blog/${relatedBlog?.slug?.current}`}>
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-shop_dark_green transition-colors">
                        {relatedBlog?.title}
                      </h3>
                    </Link>
                    <Link
                      href={`/blog/${relatedBlog?.slug?.current}`}
                      className="inline-flex items-center gap-2 text-sm text-shop_dark_green font-semibold hover:gap-3 transition-all mt-2"
                    >
                      Baca Artikel
                      <ArrowRight size={14} />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SingleBlogPage;
