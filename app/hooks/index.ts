import { useEffect, useRef } from "react";

// Custom hook untuk mendeteksi klik di luar elemen
export function useOutsideClick<T extends HTMLElement>
(callback: () => void) {
    // Membuat referensi untuk elemen HTML
    const ref = useRef<T>(null);

    useEffect(() => {
        // Fungsi yang akan dijalankan ketika terjadi klik
        const handleClickedOutside = (e: MouseEvent) => {
            // Memeriksa apakah klik terjadi di luar elemen yang direferensikan
            if(ref.current && !ref.current.contains(e.target as Node)) {
                callback();
            };
        }
        // Menambahkan event listener untuk mousedown
        document.addEventListener("mousedown", handleClickedOutside);

        // Membersihkan event listener ketika komponen unmount
        return () => {
            document.removeEventListener("mousedown", handleClickedOutside);
        };
    }, [callback]);

    // Mengembalikan referensi untuk digunakan komponen
    return ref;
}
