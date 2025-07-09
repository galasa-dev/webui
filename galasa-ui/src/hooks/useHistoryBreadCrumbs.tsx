'use client';
import { useCallback, useEffect, useState } from "react";
import { BreadCrumbProps } from "@/utils/interfaces";
import { HOME } from "@/utils/constants/breadcrumb";
import { usePathname } from "next/navigation";

const SESSION_STORAGE_KEY = 'breadCrumbHistory';

/**
 * Custom Hook to manage BreadCrumbs history and save it to the sessionStorage
 * 
 * @returns breadCrumbItems - current bread crumb items in the history
 * @returns pushBreadCrumb - function to add bread crumb to the history
 * @returns resetBreadCrumbs - function to reset all breadcrumbs to HOME
 */
export default function useHistoryBreadCrubs() {
    const [items, setItems] = useState<BreadCrumbProps[]>([]);
    const pathname = usePathname();

    // Load items initially from session storage
    useEffect(() => {
        const storedItems = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedItems) {
            setItems(JSON.parse(storedItems));
        } else {
            // Default starting point
            setItems([HOME]);
        }
    }, []);

    // Function to add a new breadcrumb item
    const pushBreadCrumb = useCallback((item: BreadCrumbProps) => {
        // Avoid duplicate items (If the user refreshes the page, it will not add the same item again)
        setItems((prevItems) => {
            const newItems = [...prevItems];
            if (newItems[newItems.length - 1]?.route !== item.route) {
                newItems.push(item);
            }
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    }, []);

    // Funtion to reset the breadcrumbs (e.g. when clicking HOME) 
    const resetBreadCrumbs = useCallback((baseItems: BreadCrumbProps[] = [HOME]) => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(baseItems));
        setItems(baseItems);
    }, []);

    // Handle browser backward/forward navigation
    useEffect(() => {
        setItems((prevItems) => {
            const currentPathIndex = prevItems.findIndex(item => item.route === pathname);

            // If the current path is found in our history, truncate the list to that point
            if (currentPathIndex > -1) {
                const newItems = prevItems.slice(0, currentPathIndex + 1);
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newItems));
                return newItems;
            }
            return prevItems;
        });
    }, [pathname])

    return {breadCrumbItems: items, pushBreadCrumb, resetBreadCrumbs}
}