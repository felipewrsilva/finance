import { notFound } from "next/navigation";
import { getCategoryById } from "@/modules/categories/actions";
import { CategoryForm } from "@/components/settings/category-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit category</h1>
        <p className="text-sm text-gray-500">{category.name}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm max-w-lg">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
