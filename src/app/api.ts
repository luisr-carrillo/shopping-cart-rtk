export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  imageAlt: string;
  imageCredit: string;
};

// utility function to simulate slowness in an API call
// eslint-disable-next-line no-promise-executor-return
const sleep = (time: number) => new Promise((res) => setTimeout(res, time));

export async function getProducts(): Promise<Product[]> {
  const results = await fetch('/products.json');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const products: Product[] = await results.json();

  return products;
}

export type CartItems = { [productID: string]: number };
export type CheckoutResponse = { success: boolean; error?: string };

export async function checkout(items: CartItems): Promise<CheckoutResponse> {
  const modifier = Object.keys(items).length > 0 ? 'success' : 'error';
  const url = `/checkout-${modifier}.json`;
  await sleep(500);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(items),
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: CheckoutResponse = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data;
}
