import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useSearch } from 'wouter';
import { getSkills, getCategories } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';
import { SearchBar } from '@/components/skills/SearchBar';
import { CategoryFilter } from '@/components/skills/CategoryFilter';
const SORT_OPTIONS = [
    { value: 'stars', label: 'Most Stars' },
    { value: 'downloads', label: 'Most Downloads' },
    { value: 'rating', label: 'Top Rated' },
];
const PAGE_SIZE = 12;
export function SkillsPage() {
    const searchString = useSearch();
    const searchParams = new URLSearchParams(searchString);
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    // Get initial values from URL params
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category'));
    const [sort, setSort] = useState(searchParams.get('sort') || 'stars');
    const [offset, setOffset] = useState(parseInt(searchParams.get('offset') || '0', 10));
    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await getCategories();
                setCategories(data);
            }
            catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        }
        fetchCategories();
    }, []);
    // Fetch skills when filters change
    useEffect(() => {
        async function fetchSkills() {
            setLoading(true);
            try {
                const response = await getSkills({
                    q: query || undefined,
                    category: selectedCategory || undefined,
                    sort,
                    limit: PAGE_SIZE,
                    offset,
                });
                setSkills(response.data);
                setTotalCount(response.total);
            }
            catch (error) {
                console.error('Failed to fetch skills:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchSkills();
    }, [query, selectedCategory, sort, offset]);
    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (query)
            params.set('q', query);
        if (selectedCategory)
            params.set('category', selectedCategory);
        if (sort !== 'stars')
            params.set('sort', sort);
        if (offset > 0)
            params.set('offset', offset.toString());
        const newSearch = params.toString();
        const currentPath = window.location.pathname;
        const newUrl = newSearch ? `${currentPath}?${newSearch}` : currentPath;
        window.history.replaceState({}, '', newUrl);
    }, [query, selectedCategory, sort, offset]);
    const handleSearchChange = useCallback((value) => {
        setQuery(value);
        setOffset(0); // Reset to first page on search
    }, []);
    const handleCategoryChange = useCallback((category) => {
        setSelectedCategory(category);
        setOffset(0); // Reset to first page on category change
    }, []);
    const handleSortChange = useCallback((newSort) => {
        setSort(newSort);
        setOffset(0); // Reset to first page on sort change
    }, []);
    const handleFavoriteChange = (skillId, isFavorited) => {
        setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, isFavorited } : s)));
    };
    const handleRatingChange = (skillId, avgRating, ratingCount) => {
        setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, avgRating, ratingCount } : s)));
    };
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    const handlePrevPage = () => {
        if (offset > 0) {
            setOffset(offset - PAGE_SIZE);
        }
    };
    const handleNextPage = () => {
        if (offset + PAGE_SIZE < totalCount) {
            setOffset(offset + PAGE_SIZE);
        }
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "Browse Skills" }), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx(SearchBar, { value: query, onChange: handleSearchChange, className: "flex-1" }), _jsxs("div", { className: "flex gap-2", children: [SORT_OPTIONS.map((option) => (_jsx(Button, { variant: sort === option.value ? 'default' : 'outline', size: "sm", onClick: () => handleSortChange(option.value), className: "hidden sm:inline-flex", children: option.label }, option.value))), _jsx("select", { value: sort, onChange: (e) => handleSortChange(e.target.value), className: "sm:hidden h-9 rounded-md border border-border bg-background px-3 text-sm", children: SORT_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] }), _jsx(CategoryFilter, { categories: categories, selectedCategory: selectedCategory, onChange: handleCategoryChange })] }), _jsx(SkillList, { skills: skills, loading: loading, emptyMessage: query || selectedCategory
                    ? 'No skills match your filters'
                    : 'No skills available yet', onFavoriteChange: handleFavoriteChange, onRatingChange: handleRatingChange }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-4 mt-8", children: [_jsx(Button, { variant: "outline", onClick: handlePrevPage, disabled: offset === 0, children: "Previous" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Page ", currentPage, " of ", totalPages] }), _jsx(Button, { variant: "outline", onClick: handleNextPage, disabled: offset + PAGE_SIZE >= totalCount, children: "Next" })] }))] }));
}
