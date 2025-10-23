import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Title } from "../text";

// 💰 Ubah dari dolar ke Rupiah Indonesia
const priceArray = [
  { title: "Di bawah Rp10.000", value: "0-10000" },
  { title: "Rp10.000 - Rp20.000", value: "10000-20000" },
  { title: "Rp20.000 - Rp30.000", value: "20000-30000" },
  { title: "Rp30.000 - Rp50.000", value: "30000-50000" },
  { title: "Di atas Rp50.000", value: "50000-1000000" },
];

interface Props {
  selectedPrice?: string | null;
  setSelectedPrice: React.Dispatch<React.SetStateAction<string | null>>;
}

const PriceList = ({ selectedPrice, setSelectedPrice }: Props) => {
  return (
    <div className="w-full bg-white p-5">
      <Title className="text-base font-black">Harga</Title>
      <RadioGroup className="mt-2 space-y-1" value={selectedPrice || ""}>
        {priceArray?.map((price, index) => (
          <div
            key={index}
            onClick={() => setSelectedPrice(price?.value)}
            className="flex items-center space-x-2 hover:cursor-pointer"
          >
            <RadioGroupItem
              value={price?.value}
              id={price?.value}
              className="rounded-sm"
            />
            <Label
              htmlFor={price.value}
              className={`${
                selectedPrice === price?.value
                  ? "font-semibold text-shop_dark_green"
                  : "font-normal"
              }`}
            >
              {price?.title}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedPrice && (
        <button
          onClick={() => setSelectedPrice(null)}
          className="text-sm font-medium mt-2 underline underline-offset-2 decoration-[1px] hover:text-shop_dark_green hoverEffect"
        >
          Reset pilihan
        </button>
      )}
    </div>
  );
};

export default PriceList;
