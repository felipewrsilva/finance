import { CategoryForm } from "@/components/settings/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New category</h1>
        <p className="text-sm text-gray-500">Create a custom category</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm max-w-lg">
        <CategoryForm />
      </div>
    </div>
  );
}
