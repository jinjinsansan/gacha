export type DemoPattern = {
  id: number;
  currency: "BTC" | "ETH" | "XRP" | "TRX";
  machine_color: string;
  effect_1: string;
  effect_2: string;
  base_result: boolean;
  video_url: string;
  prize_amount: number;
  weight: number;
};

export const demoPatterns: DemoPattern[] = [
  { id: 1, currency: "BTC", machine_color: "Gold", effect_1: "Hot", effect_2: "Hot", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_01.mp4", prize_amount: 250, weight: 1 },
  { id: 2, currency: "BTC", machine_color: "Black", effect_1: "Hot", effect_2: "Hot", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_02.mp4", prize_amount: 250, weight: 1 },
  { id: 3, currency: "ETH", machine_color: "Gold", effect_1: "Hot", effect_2: "Hot", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_03.mp4", prize_amount: 15, weight: 1 },
  { id: 4, currency: "ETH", machine_color: "Silver", effect_1: "Hot", effect_2: "Hot", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_04.mp4", prize_amount: 15, weight: 1 },
  { id: 5, currency: "ETH", machine_color: "Blue", effect_1: "Hot", effect_2: "Hot", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_05.mp4", prize_amount: 15, weight: 1 },
  { id: 6, currency: "ETH", machine_color: "Blue", effect_1: "Dark", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_06.mp4", prize_amount: 15, weight: 1 },
  { id: 7, currency: "ETH", machine_color: "Silver", effect_1: "Dark", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_07.mp4", prize_amount: 15, weight: 1 },
  { id: 8, currency: "ETH", machine_color: "Gold", effect_1: "Dark", effect_2: "Dark", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_08.mp4", prize_amount: 15, weight: 1 },
  { id: 9, currency: "ETH", machine_color: "Silver", effect_1: "Hot", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_09.mp4", prize_amount: 15, weight: 2 },
  { id: 10, currency: "ETH", machine_color: "Blue", effect_1: "Dark", effect_2: "Dark", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_10.mp4", prize_amount: 15, weight: 1 },
  { id: 11, currency: "ETH", machine_color: "Gold", effect_1: "Hot", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_11.mp4", prize_amount: 15, weight: 1 },
  { id: 13, currency: "ETH", machine_color: "Silver", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_13.mp4", prize_amount: 15, weight: 1 },
  { id: 14, currency: "ETH", machine_color: "Gold", effect_1: "Hot", effect_2: "Hot", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_14.mp4", prize_amount: 15, weight: 1 },
  { id: 15, currency: "ETH", machine_color: "Blue", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_15.mp4", prize_amount: 15, weight: 1 },
  { id: 16, currency: "ETH", machine_color: "Gold", effect_1: "Hot", effect_2: "Return", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_16.mp4", prize_amount: 15, weight: 1 },
  { id: 17, currency: "XRP", machine_color: "Pink", effect_1: "Dark", effect_2: "Dark", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_17.mp4", prize_amount: 4, weight: 1 },
  { id: 18, currency: "XRP", machine_color: "Blue", effect_1: "Dark", effect_2: "Dark", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_18.mp4", prize_amount: 4, weight: 1 },
  { id: 19, currency: "XRP", machine_color: "Green", effect_1: "Dark", effect_2: "Dark", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_19.mp4", prize_amount: 4, weight: 1 },
  { id: 20, currency: "XRP", machine_color: "Blue", effect_1: "Dark", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_20.mp4", prize_amount: 4, weight: 1 },
  { id: 21, currency: "XRP", machine_color: "Pink", effect_1: "Dark", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_21.mp4", prize_amount: 4, weight: 2 },
  { id: 22, currency: "XRP", machine_color: "Green", effect_1: "Dark", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_22.mp4", prize_amount: 4, weight: 2 },
  { id: 25, currency: "XRP", machine_color: "Blue", effect_1: "Dark", effect_2: "Return", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_25.mp4", prize_amount: 4, weight: 1 },
  { id: 26, currency: "XRP", machine_color: "Pink", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_26.mp4", prize_amount: 4, weight: 1 },
  { id: 27, currency: "XRP", machine_color: "Green", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_27.mp4", prize_amount: 4, weight: 1 },
  { id: 28, currency: "XRP", machine_color: "Pink", effect_1: "Hot", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_28.mp4", prize_amount: 4, weight: 1 },
  { id: 29, currency: "XRP", machine_color: "Blue", effect_1: "Hot", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_29.mp4", prize_amount: 4, weight: 1 },
  { id: 30, currency: "XRP", machine_color: "Green", effect_1: "Hot", effect_2: "Hot", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_30.mp4", prize_amount: 4, weight: 1 },
  { id: 31, currency: "XRP", machine_color: "Pink", effect_1: "Hot", effect_2: "Hot", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_31.mp4", prize_amount: 4, weight: 2 },
  { id: 33, currency: "TRX", machine_color: "Red", effect_1: "Dark", effect_2: "Dark", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_33.mp4", prize_amount: 3, weight: 1 },
  { id: 34, currency: "TRX", machine_color: "Black", effect_1: "Dark", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_34.mp4", prize_amount: 3, weight: 1 },
  { id: 35, currency: "TRX", machine_color: "Purple", effect_1: "Hot", effect_2: "Return", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_35.mp4", prize_amount: 3, weight: 1 },
  { id: 36, currency: "TRX", machine_color: "Purple", effect_1: "Hot", effect_2: "Hot", base_result: true, video_url: "https://cdn.gachagacha.com/videos/pattern_36.mp4", prize_amount: 3, weight: 1 },
  { id: 37, currency: "TRX", machine_color: "Red", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_37.mp4", prize_amount: 3, weight: 1 },
  { id: 38, currency: "TRX", machine_color: "Black", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_38.mp4", prize_amount: 3, weight: 1 },
  { id: 39, currency: "TRX", machine_color: "Purple", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_39.mp4", prize_amount: 3, weight: 1 },
  { id: 40, currency: "TRX", machine_color: "Red", effect_1: "Hot", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_40.mp4", prize_amount: 3, weight: 2 },
  { id: 41, currency: "TRX", machine_color: "Black", effect_1: "Hot", effect_2: "Hot", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_41.mp4", prize_amount: 3, weight: 2 },
  { id: 42, currency: "TRX", machine_color: "Purple", effect_1: "Hot", effect_2: "Return", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_42.mp4", prize_amount: 3, weight: 2 },
  { id: 43, currency: "TRX", machine_color: "Red", effect_1: "Dark", effect_2: "Return", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_43.mp4", prize_amount: 3, weight: 2 },
  { id: 44, currency: "TRX", machine_color: "Black", effect_1: "Dark", effect_2: "Return", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_44.mp4", prize_amount: 3, weight: 1 },
  { id: 47, currency: "TRX", machine_color: "Purple", effect_1: "Dark", effect_2: "Return", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_47.mp4", prize_amount: 3, weight: 1 },
  { id: 50, currency: "TRX", machine_color: "Purple", effect_1: "Dark", effect_2: "Dark", base_result: false, video_url: "https://cdn.gachagacha.com/videos/pattern_50.mp4", prize_amount: 3, weight: 1 },
];
