import Container from "@/components/Container";
import { Title } from "@/components/text";
import React from "react";
import { getAllBlogs } from "@/sanity/queries";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GET_ALL_BLOGResult } from "@/sanity.types";

dayjs.locale("id");

const BlogPage = async () => {
  let blogs: GET_ALL_BLOGResult = [];
  
  try {
    blogs = await getAllBlogs(50); // Get 50 latest blogs
  } catch (error) {
    console.error('Error loading blogs:', error);
    blogs = [];
  }

  return (
    <div className="py-10">
      <Container>
        {/* Header */}
        <div className="mb-10 text-center">
          <Title>Blog & Artikel</Title>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Temukan tips, resep, dan informasi menarik seputar bahan makanan
            segar dan gaya hidup sehat
          </p>
        </div>

        {/* Featured Blog (First Blog) */}
        {blogs && blogs.length > 0 && blogs[0] && (
          <div className="mb-12">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                {blogs[0]?.mainImage && (
                  <Link
                    href={`/blog/${blogs[0]?.slug?.current}`}
                    className="relative h-64 md:h-full overflow-hidden group"
                  >
                    <Image
                      src={urlFor(blogs[0]?.mainImage).url()}
                      alt={blogs[0]?.title || "Blog image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-shop_dark_green text-white">
                        Featured
                      </Badge>
                    </div>
                  </Link>
                )}

                {/* Content */}
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {blogs[0]?.blogcategories &&
                      blogs[0]?.blogcategories.length > 0 &&
                      blogs[0]?.blogcategories[0]?.title && (
                        <Badge variant="outline" className="text-shop_dark_green border-shop_dark_green">
                          {blogs[0]?.blogcategories[0]?.title}
                        </Badge>
                      )}
                    {blogs[0]?.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {dayjs(blogs[0]?.publishedAt).format("D MMMM YYYY")}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link href={`/blog/${blogs[0]?.slug?.current}`}>
                    <h2 className="text-3xl font-bold mb-4 hover:text-shop_dark_green transition-colors line-clamp-2">
                      {blogs[0]?.title || "Untitled"}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {blogs[0]?.body?.[0]?._type === "block" &&
                    blogs[0]?.body?.[0]?.children?.[0]?.text
                      ? blogs[0]?.body?.[0]?.children?.[0]?.text
                      : "Baca artikel lengkap untuk informasi lebih lanjut..."}
                  </p>

                  <Link
                    href={`/blog/${blogs[0]?.slug?.current}`}
                    className="inline-flex items-center gap-2 text-shop_dark_green font-semibold hover:gap-3 transition-all"
                  >
                    Baca Selengkapnya
                    <ArrowRight size={18} />
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs?.slice(1).map((blog) => {
            if (!blog || !blog.slug?.current) return null;
            
            return (
              <Card
                key={blog?._id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                {blog?.mainImage && (
                  <Link
                    href={`/blog/${blog?.slug?.current}`}
                    className="relative h-48 block overflow-hidden"
                  >
                    <Image
                      src={urlFor(blog?.mainImage).url()}
                      alt={blog?.title || "Blog image"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                )}

                {/* Content */}
                <CardContent className="p-5">
                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                    {blog?.blogcategories && 
                     blog?.blogcategories.length > 0 && 
                     blog?.blogcategories[0]?.title && (
                      <Badge
                        variant="outline"
                        className="text-shop_dark_green border-shop_dark_green"
                      >
                        {blog?.blogcategories[0]?.title}
                      </Badge>
                    )}
                    {blog?.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>
                          {dayjs(blog?.publishedAt).format("D MMM YYYY")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${blog?.slug?.current}`}>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-shop_dark_green transition-colors">
                      {blog?.title || "Untitled"}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {blog?.body?.[0]?._type === "block" &&
                    blog?.body?.[0]?.children?.[0]?.text
                      ? blog?.body?.[0]?.children?.[0]?.text
                      : "Baca artikel lengkap..."}
                  </p>

                  {/* Read More */}
                  <Link
                    href={`/blog/${blog?.slug?.current}`}
                    className="inline-flex items-center gap-2 text-sm text-shop_dark_green font-semibold hover:gap-3 transition-all"
                  >
                    Baca Artikel
                    <ArrowRight size={14} />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {(!blogs || blogs.length === 0) && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-20 h-20 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Artikel
            </h3>
            <p className="text-gray-500">
              Artikel blog akan segera hadir. Pantau terus!
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BlogPage;
