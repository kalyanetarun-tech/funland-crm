1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
export const FOOD_MENU = [
  { name: "Mineral Water", category: "Cold Beverages", price: 20, type: "food" },
  { name: "Soft Drink 200 ML / 750ML", category: "Cold Beverages", price: 20, type: "food" },
  { name: "DAHI LASSI SWEET SALTED", category: "Cold Beverages", price: 80, type: "food" },
  { name: "BUTTER MILK", category: "Cold Beverages", price: 40, type: "food" },
  { name: "Red Bull", category: "Cold Beverages", price: 150, type: "food" },
  { name: "Masala Chai", category: "Cold Beverages", price: 30, type: "food" },
  { name: "Coffee", category: "Cold Beverages", price: 40, type: "food" },
  { name: "Cold Coffee", category: "Cold Beverages", price: 110, type: "food" },
  { name: "Juice (Sweet Lime/Orange/Pineapple)", category: "Cold Beverages", price: 70, type: "food" },
  { name: "Jal Jeera", category: "Cold Beverages", price: 25, type: "food" },
  { name: "Lemon Ice Tea", category: "Cold Beverages", price: 75, type: "food" },
  { name: "Fresh Lime Soda", category: "Cold Beverages", price: 75, type: "food" },
  { name: "VEG NOODELS", category: "Chinese", price: 125, type: "food" },
  { name: "SEZWAN NOODELS", category: "Chinese", price: 135, type: "food" },
  { name: "VEG HAKKA NOODELS", category: "Chinese", price: 140, type: "food" },
  { name: "MANCHURIAN DRY/GRAVY", category: "Chinese", price: 125, type: "food" },
  { name: "CHILLY PANEER DRY /GRAVY", category: "Chinese", price: 140, type: "food" },
  { name: "PANEER 65", category: "Chinese", price: 160, type: "food" },
  { name: "VEG KOTHEY", category: "Chinese", price: 140, type: "food" },
  { name: "CRISPY CORN", category: "Chinese", price: 140, type: "food" },
  { name: "CHILY POTATO", category: "Chinese", price: 125, type: "food" },
  { name: "VEG FRIED RICE", category: "Chinese", price: 140, type: "food" },
  { name: "PANEER TIKKA DRY", category: "Snacks", price: 210, type: "food" },
  { name: "MALAI TIKKA DRY", category: "Snacks", price: 210, type: "food" },
  { name: "HARYIALI TIKKA", category: "Snacks", price: 175, type: "food" },
  { name: "AACHARI TIKKA", category: "Snacks", price: 170, type: "food" },
  { name: "SEEKH KEBAB", category: "Snacks", price: 180, type: "food" },
  { name: "DHAI KEBEB", category: "Snacks", price: 180, type: "food" },
  { name: "HARABHARA KEBAB", category: "Snacks", price: 180, type: "food" },
  { name: "BABY CORN TIKKA", category: "Snacks", price: 170, type: "food" },
  { name: "ALOO TIKKA DRY", category: "Snacks", price: 170, type: "food" },
  { name: "French Fries", category: "Snacks", price: 120, type: "food" },
  { name: "Cheese Chilli ball", category: "Snacks", price: 150, type: "food" },
  { name: "Mexican Roll", category: "Snacks", price: 155, type: "food" },
  { name: "Cheese kukret", category: "Snacks", price: 170, type: "food" },
  { name: "Paneer Makhmali", category: "Snacks", price: 190, type: "food" },
  { name: "Veg Lolipop", category: "Snacks", price: 210, type: "food" },
  { name: "Long Peanut Kabeb", category: "Snacks", price: 150, type: "food" },
  { name: "MOONG BHAJYIA", category: "Snacks", price: 80, type: "food" },
  { name: "PANEER PAKDOA", category: "Snacks", price: 90, type: "food" },
  { name: "MIX VEG PAKODA", category: "Snacks", price: 80, type: "food" },
  { name: "ONION PAKODA", category: "Snacks", price: 80, type: "food" },
  { name: "ALOO BADA", category: "Hi Snacks", price: 25, type: "food" },
  { name: "PAV BHAJI", category: "Hi Snacks", price: 90, type: "food" },
  { name: "CHOLE BHATURE", category: "Hi Snacks", price: 120, type: "food" },
  { name: "PURI BHAJI", category: "Hi Snacks", price: 110, type: "food" },
  { name: "POHA", category: "Hi Snacks", price: 25, type: "food" },
  { name: "KACHORI", category: "Hi Snacks", price: 25, type: "food" },
  { name: "SAMOSA", category: "Hi Snacks", price: 25, type: "food" },
  { name: "IDLI SAMBHAR", category: "Hi Snacks", price: 110, type: "food" },
  { name: "VADA SAMBHAR", category: "Hi Snacks", price: 110, type: "food" },
  { name: "Bread Butter", category: "Sandwich", price: 50, type: "food" },
  { name: "Butter Toast", category: "Sandwich", price: 50, type: "food" },
  { name: "Bread Butter Jam", category: "Sandwich", price: 60, type: "food" },
  { name: "Butter Toast Jam", category: "Sandwich", price: 60, type: "food" },
  { name: "Cheese Sandwich", category: "Sandwich", price: 80, type: "food" },
  { name: "CHEESE Chutney Sandwich", category: "Sandwich", price: 80, type: "food" },
  { name: "Veg. Sandwich", category: "Sandwich", price: 70, type: "food" },
  { name: "Veg. Club Sandwich", category: "Sandwich", price: 110, type: "food" },
  { name: "MASALA SANDWICH", category: "Sandwich", price: 110, type: "food" },
  { name: "CHEESE MASALA S/W", category: "Sandwich", price: 125, type: "food" },
  { name: "Green Salad", category: "Salads", price: 60, type: "food" },
  { name: "Cucumber Salad", category: "Salads", price: 50, type: "food" },
  { name: "Keemchi Salad", category: "Salads", price: 130, type: "food" },
  { name: "Russian Salad", category: "Salads", price: 135, type: "food" },
  { name: "Fruit Salad", category: "Salads", price: 130, type: "food" },
  { name: "peanut chat", category: "Salads", price: 100, type: "food" },
  { name: "ONION SALAD", category: "Salads", price: 40, type: "food" },
  { name: "Fry Papad", category: "PAPAD ETC", price: 25, type: "food" },
  { name: "Roasted Papad", category: "PAPAD ETC", price: 25, type: "food" },
  { name: "Masala Papad fried/ roasted", category: "PAPAD ETC", price: 40, type: "food" },
  { name: "Papad Churi", category: "PAPAD ETC", price: 70, type: "food" },
  { name: "Sweet Corn Soup", category: "Soup", price: 110, type: "food" },
  { name: "Hot & Sour", category: "Soup", price: 100, type: "food" },
  { name: "Tomato SOUP", category: "Soup", price: 80, type: "food" },
  { name: "Mancho Soup", category: "Soup", price: 100, type: "food" },
  { name: "LEMON CORIANDER", category: "Soup", price: 100, type: "food" },
  { name: "MUSHROOM SOUP", category: "Soup", price: 120, type: "food" },
  { name: "VEG GARLIC", category: "Soup", price: 100, type: "food" },
  { name: "Boondi Raita", category: "Raita", price: 110, type: "food" },
  { name: "PUDHINA RAITA", category: "Raita", price: 100, type: "food" },
  { name: "ONION RAITA", category: "Raita", price: 100, type: "food" },
  { name: "Veg Raita", category: "Raita", price: 110, type: "food" },
  { name: "Fruit Raita", category: "Raita", price: 130, type: "food" },
  { name: "DAL FRY", category: "Dal", price: 110, type: "food" },
  { name: "JEERA DAL", category: "Dal", price: 100, type: "food" },
  { name: "DAL TADKA", category: "Dal", price: 110, type: "food" },
  { name: "DAL PUNJABI", category: "Dal", price: 140, type: "food" },
  { name: "DAL MAKHANI", category: "Dal", price: 150, type: "food" },
  { name: "PALAK PANEER", category: "Choice of Paneer", price: 165, type: "food" },
  { name: "MUTTER PANEER", category: "Choice of Paneer", price: 165, type: "food" },
  { name: "CHANA PANEER", category: "Choice of Paneer", price: 165, type: "food" },
  { name: "BUTTER PANEER MASALA", category: "Choice of Paneer", price: 195, type: "food" },
  { name: "PUNJABI PANEER", category: "Choice of Paneer", price: 195, type: "food" },
  { name: "PANEER MASALA", category: "Choice of Paneer", price: 185, type: "food" },
  { name: "PANEER KOHALAPURI", category: "Choice of Paneer", price: 195, type: "food" },
  { name: "PANEER LABABDAR", category: "Choice of Paneer", price: 210, type: "food" },
  { name: "KADAI PANEER", category: "Choice of Paneer", price: 190, type: "food" },
  { name: "SHAHI PANEER", category: "Choice of Paneer", price: 210, type: "food" },
  { name: "PANEER HANDI", category: "Choice of Paneer", price: 185, type: "food" },
  { name: "KAJU CURRY", category: "Kaju Special", price: 190, type: "food" },
  { name: "KAJU PANEER", category: "Kaju Special", price: 195, type: "food" },
  { name: "KAJU MASALA", category: "Kaju Special", price: 185, type: "food" },
  { name: "MIX VEG", category: "Vegetable", price: 155, type: "food" },
  { name: "VEG KOHLAPURI", category: "Vegetable", price: 170, type: "food" },
  { name: "VEG HANDI", category: "Vegetable", price: 170, type: "food" },
  { name: "VEG KADAI", category: "Vegetable", price: 170, type: "food" },
  { name: "BHINDI MASALA", category: "Vegetable", price: 135, type: "food" },
  { name: "BHINDI FRY", category: "Vegetable", price: 135, type: "food" },
  { name: "KURKURI BHINDI", category: "Vegetable", price: 140, type: "food" },
  { name: "BHINDI DO PYAZA", category: "Vegetable", price: 165, type: "food" },
  { name: "ALOO MATTAR", category: "Vegetable", price: 135, type: "food" },
  { name: "ALOO GOBHI", category: "Vegetable", price: 120, type: "food" },
  { name: "ALOO TAMATER", category: "Vegetable", price: 120, type: "food" },
  { name: "JEERA ALOO", category: "Vegetable", price: 135, type: "food" },
  { name: "PALAK MASALA", category: "Vegetable", price: 135, type: "food" },
  { name: "MATTER GOBHI", category: "Vegetable", price: 120, type: "food" },
  { name: "GOBHI MASALA", category: "Vegetable", price: 120, type: "food" },
  { name: "CHANA MASALA", category: "Vegetable", price: 130, type: "food" },
  { name: "ALOO CHANA", category: "Vegetable", price: 130, type: "food" },
  { name: "ALOO METHI", category: "Vegetable", price: 135, type: "food" },
  { name: "METHI MASALA", category: "Vegetable", price: 130, type: "food" },
  { name: "METHI MATAR MALI", category: "Vegetable", price: 170, type: "food" },
  { name: "LAHASONI PALAK", category: "Vegetable", price: 160, type: "food" },
  { name: "DUM ALOO", category: "Vegetable", price: 170, type: "food" },
  { name: "NAVRATNA KORMA", category: "Vegetable", price: 220, type: "food" },
  { name: "SEV TAMATER", category: "Vegetable", price: 110, type: "food" },
  { name: "DOODH SEV TAMATER", category: "Vegetable", price: 125, type: "food" },
  { name: "SEV MASALA", category: "Vegetable", price: 110, type: "food" },
  { name: "SEV PANEER", category: "Vegetable", price: 155, type: "food" },
  { name: "MALAI KOFTA", category: "Kofta", price: 195, type: "food" },
  { name: "PUNJABI KOFTA", category: "Kofta", price: 190, type: "food" },
  { name: "PANEER KOFTA", category: "Kofta", price: 210, type: "food" },
  { name: "NARGIS KOFTA", category: "Kofta", price: 225, type: "food" },
  { name: "MASALA KOFTA", category: "Kofta", price: 195, type: "food" },
  { name: "HYDRABADI KOFTA", category: "Kofta", price: 185, type: "food" },
  { name: "TAWA ROTI PLAIN", category: "Choice of Breads", price: 15, type: "food" },
  { name: "TAWA ROTI BUTTER", category: "Choice of Breads", price: 20, type: "food" },
  { name: "TAWA PARATHA", category: "Choice of Breads", price: 25, type: "food" },
  { name: "LACHHA PARATHA", category: "Choice of Breads", price: 25, type: "food" },
  { name: "ALOO PARATHA", category: "Choice of Paratha with Curd", price: 50, type: "food" },
  { name: "GOBHI PARATHA", category: "Choice of Paratha with Curd", price: 50, type: "food" },
  { name: "PANEER PARTHA", category: "Choice of Paratha with Curd", price: 60, type: "food" },
  { name: "MIX PARATHA", category: "Choice of Paratha with Curd", price: 50, type: "food" },
  { name: "ONION PARTHA", category: "Choice of Paratha with Curd", price: 50, type: "food" },
  { name: "SEV PARATHA", category: "Choice of Paratha with Curd", price: 50, type: "food" },
  { name: "JEERA RICE", category: "Choice of Rice", price: 120, type: "food" },
  { name: "PLAIN RICE", category: "Choice of Rice", price: 100, type: "food" },
  { name: "KHICHADI PLAIN", category: "Choice of Rice", price: 120, type: "food" },
  { name: "BUTTER KHICHDI", category: "Choice of Rice", price: 135, type: "food" },
  { name: "VEG BRIYANI", category: "Choice of Rice", price: 165, type: "food" },
  { name: "VEG PULAO", category: "Choice of Rice", price: 160, type: "food" },
  { name: "SHAHI PULAO", category: "Choice of Rice", price: 170, type: "food" },
  { name: "MUTTER PULO", category: "Choice of Rice", price: 155, type: "food" },
  { name: "RASGULLA", category: "Deserts", price: 50, type: "food" },
  { name: "GLABJAMUN", category: "Deserts", price: 55, type: "food" },
  { name: "GULABJAMUN WITH ICECREAM", category: "Deserts", price: 70, type: "food" },
  { name: "SHRIKHAND", category: "Deserts", price: 50, type: "food" },
  { name: "FRUIT CUSTURD", category: "Deserts", price: 60, type: "food" },
  { name: "CHOICE OF ICECREAM", category: "Deserts", price: 70, type: "food" },
];

// Helper to merge with existing activities without duplicates
export const mergeFoodMenuWithActivities = (existingActivities) => {
  const existingNames = new Set(existingActivities.map(a => a.name?.toLowerCase().trim()));
  const newItems = FOOD_MENU.filter(item => !existingNames.has(item.name.toLowerCase()));
  return [...existingActivities, ...newItems];
};

// Total: 160 items