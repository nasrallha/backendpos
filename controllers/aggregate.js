      //   const _newOrder = await Order.aggregate([
      //     {
      //       $match: { _id: newOrder._id },
      //     },
      //     {
      //       $addFields: {
      //         orderItems: {
      //           $map: {
      //             input: "$items",
      //             in: {
      //               $mergeObjects: [
      //                 "$$this",
      //                 {
      //                   subTotal: {
      //                     $round: [
      //                       {
      //                         $multiply: ["$$this.price", "$$this.quantity"],
      //                       },
      //                       2,
      //                     ],
      //                   },
      //                 },
      //                 //total afterdiscount
      //                 {
      //                   subTotal2: {
      //                     $cond: [
      //                       { $eq: ["$priceIncludeTax", true] },
      //                       //true
      //                       {
      //                         $round: [
      //                           {
      //                             $round: [
      //                               {
      //                                 $divide: [
      //                                   {
      //                                     $subtract: [
      //                                       {
      //                                         $multiply: [
      //                                           "$$this.price",
      //                                           "$$this.quantity",
      //                                         ],
      //                                       },
      //                                       "$$this.discount",
      //                                     ],
      //                                   },
      //                                   {
      //                                     $add: [
      //                                       1,
      //                                       { $divide: ["$taxValue", 100] },
      //                                     ],
      //                                   },
      //                                 ],
      //                               },
      //                               2,
      //                             ],
      //                           },
      //                           3,
      //                         ],
      //                       },
      //                       //fasle
      //                       {
      //                         $round: [
      //                           {
      //                             $subtract: [
      //                               {
      //                                 $multiply: [
      //                                   "$$this.price",
      //                                   "$$this.quantity",
      //                                 ],
      //                               },
      //                               "$$this.discount",
      //                             ],
      //                           },
      //                           2,
      //                         ],
      //                       },
      //                     ],
      //                   },
      //                 },
      //                 //item tax
      //                 {
      //                   tax: {
      //                     $cond: [
      //                       { $eq: ["$priceIncludeTax", true] },
      //                       //true
      //                       {
      //                         $round: [
      //                           {
      //                             $multiply: [
      //                               {
      //                                 $divide: [
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $subtract: [
      //                                           {
      //                                             $round: [
      //                                               {
      //                                                 $multiply: [
      //                                                   "$$this.price",
      //                                                   "$$this.quantity",
      //                                                 ],
      //                                               },
      //                                               3,
      //                                             ],
      //                                           },
      //                                           "$$this.discount",
      //                                         ],
      //                                       },
      //                                       3,
      //                                     ],
      //                                   },
      //                                   {
      //                                     $add: [
      //                                       1,
      //                                       { $divide: ["$taxValue", 100] },
      //                                     ],
      //                                   },
      //                                 ],
      //                               },
      //                               {
      //                                 $divide: ["$taxValue", 100],
      //                               },
      //                             ],
      //                           },
      //                           2,
      //                         ],
      //                       },
      //                       //false
      //                       {
      //                         $round: [
      //                           {
      //                             $multiply: [
      //                               {
      //                                 $round: [
      //                                   {
      //                                     $subtract: [
      //                                       {
      //                                         $round: [
      //                                           {
      //                                             $multiply: [
      //                                               "$$this.price",
      //                                               "$$this.quantity",
      //                                             ],
      //                                           },
      //                                           3,
      //                                         ],
      //                                       },
      //                                       "$$this.discount",
      //                                     ],
      //                                   },
      //                                   3,
      //                                 ],
      //                               },
      //                               {
      //                                 $divide: ["$taxValue", 100],
      //                               },
      //                             ],
      //                           },
      //                           2,
      //                         ],
      //                       },
      //                     ],
      //                   },
      //                 },
      //                 //item total
      //                 {
      //                   total: {
      //                     $round: [
      //                       {
      //                         $add: [
      //                           //item subtotal2
      //                           {
      //                             $cond: [
      //                               { $eq: ["$priceIncludeTax", true] },
      //                               //true
      //                               {
      //                                 $round: [
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $divide: [
      //                                           {
      //                                             $subtract: [
      //                                               {
      //                                                 $multiply: [
      //                                                   "$$this.price",
      //                                                   "$$this.quantity",
      //                                                 ],
      //                                               },
      //                                               "$$this.discount",
      //                                             ],
      //                                           },
      //                                           {
      //                                             $add: [
      //                                               1,
      //                                               {
      //                                                 $divide: ["$taxValue", 100],
      //                                               },
      //                                             ],
      //                                           },
      //                                         ],
      //                                       },
      //                                       2,
      //                                     ],
      //                                   },
      //                                   3,
      //                                 ],
      //                               },
      //                               //fasle
      //                               {
      //                                 $round: [
      //                                   {
      //                                     $subtract: [
      //                                       {
      //                                         $multiply: [
      //                                           "$$this.price",
      //                                           "$$this.quantity",
      //                                         ],
      //                                       },
      //                                       "$$this.discount",
      //                                     ],
      //                                   },
      //                                   2,
      //                                 ],
      //                               },
      //                             ],
      //                           },
      //                           //item tax
      //                           {
      //                             $cond: [
      //                               { $eq: ["$priceIncludeTax", true] },
      //                               //true
      //                               {
      //                                 $round: [
      //                                   {
      //                                     $multiply: [
      //                                       {
      //                                         $divide: [
      //                                           {
      //                                             $round: [
      //                                               {
      //                                                 $subtract: [
      //                                                   {
      //                                                     $round: [
      //                                                       {
      //                                                         $multiply: [
      //                                                           "$$this.price",
      //                                                           "$$this.quantity",
      //                                                         ],
      //                                                       },
      //                                                       3,
      //                                                     ],
      //                                                   },
      //                                                   "$$this.discount",
      //                                                 ],
      //                                               },
      //                                               3,
      //                                             ],
      //                                           },
      //                                           {
      //                                             $add: [
      //                                               1,
      //                                               {
      //                                                 $divide: ["$taxValue", 100],
      //                                               },
      //                                             ],
      //                                           },
      //                                         ],
      //                                       },
      //                                       {
      //                                         $divide: ["$taxValue", 100],
      //                                       },
      //                                     ],
      //                                   },
      //                                   2,
      //                                 ],
      //                               },
      //                               //false
      //                               {
      //                                 $round: [
      //                                   {
      //                                     $multiply: [
      //                                       {
      //                                         $round: [
      //                                           {
      //                                             $subtract: [
      //                                               {
      //                                                 $round: [
      //                                                   {
      //                                                     $multiply: [
      //                                                       "$$this.price",
      //                                                       "$$this.quantity",
      //                                                     ],
      //                                                   },
      //                                                   3,
      //                                                 ],
      //                                               },
      //                                               "$$this.discount",
      //                                             ],
      //                                           },
      //                                           3,
      //                                         ],
      //                                       },
      //                                       {
      //                                         $divide: ["$taxValue", 100],
      //                                       },
      //                                     ],
      //                                   },
      //                                   2,
      //                                 ],
      //                               },
      //                             ],
      //                           },
      //                         ],
      //                       },
      //                       3,
      //                     ],
      //                   },
      //                 },
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     },
      //     // lookup
      //     // products
      //     {
      //       $lookup: {
      //         from: "products",
      //         localField: "orderItems.productId", // field in the orders collection
      //         foreignField: "_id", // field in the items collection
      //         pipeline: [
      //           {
      //             $project: {
      //               _id: 1,
      //               code: 1,
      //               name: 1,
      //               ar_name: 1,
      //               price: 1,
      //             },
      //           },
      //         ],
      //         as: "product",
      //       },
      //     },
      //     {
      //       $project: {
      //         invoiceNumber: 1,
      //         customerId: 1,
      //         createdBy: 1,
      //         order_date: 1,
      //         order_time: 1,
      //         paid: 1,
      //         remaining: 1,
      //         paid1: 1,
      //         paid2: 1,
      //         paymentMethod1: 1,
      //         paymentMethod2: 1,
      //         isDiscount: 1,
      //         isOrder: 1,
      //         discountType: 1,
      //         discountValue: 1,
      //         priceIncludeTax: 1,
      //         taxValue: 1,
      //         saleNo: 1,
      //         status: 1,
      //         items: 1,
      //         items: {
      //           $map: {
      //             input: "$orderItems",
      //             as: "i",
      //             in: {
      //               $mergeObjects: [
      //                 "$$i",
      //                 {
      //                   $first: {
      //                     $filter: {
      //                       input: "$product",
      //                       cond: { $eq: ["$$this._id", "$$i.productId"] },
      //                     },
      //                   },
      //                 },
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     },
      //     {
      //       $addFields: { orderQuantity: { $sum: "$items.quantity" } },
      //     },
      //     {
      //       $addFields: { orderSubTotal: { $sum: "$items.subTotal2" } },
      //     },
      //     {
      //       $addFields: {
      //         orderDiscount: {
      //           $cond: [
      //             { $eq: ["$discountType", 1] },
      //             // true
      //             {
      //               $round: [
      //                 {
      //                   $multiply: [
      //                     "$orderSubTotal",
      //                     { $divide: ["$discountValue", 100] },
      //                   ],
      //                 },
      //                 2,
      //               ],
      //             },
      //             //false
      //             "$discountValue",
      //           ],
      //         },
      //       },
      //     },
      //     {
      //       $addFields: {
      //         orderSubTotal2: {
      //           $round: [
      //             {
      //               $subtract: ["$orderSubTotal", "$orderDiscount"],
      //             },
      //             2,
      //           ],
      //         },
      //       },
      //     },
      //     {
      //       $addFields: {
      //         orderTax: {
      //           $cond: [
      //             { $eq: ["$isDiscount", true] },
      //             //true
      //             {
      //               $round: [
      //                 {
      //                   $multiply: [
      //                     "$orderSubTotal2",
      //                     { $divide: ["$taxValue", 100] },
      //                   ],
      //                 },
      //                 2,
      //               ],
      //             },
      //             //false
      //             { $sum: "$items.tax" },
      //           ],
      //         },
      //       },
      //     },
      //     {
      //       $addFields: {
      //         orderTotal: { $add: ["$orderSubTotal2", "$orderTax"] },
      //       },
      //     },
      //     //sellere
      //     {
      //       $lookup: {
      //         from: "users",
      //         localField: "createdBy", // field in the orders collection
      //         foreignField: "_id", // field in the items collection
      //         pipeline: [{ $project: { _id: 1, name: 1, role: 1, email: 1 } }],
      //         as: "user",
      //       },
      //     },
      //     // order customer
      //     {
      //       $lookup: {
      //         from: "customers",
      //         localField: "customerId", // field in the orders collection
      //         foreignField: "_id", // field in the items collection
      //         pipeline: [
      //           {
      //             $project: {
      //               _id: 1,
      //               code: 1,
      //               name: 1,
      //               email: 1,
      //               phone: 1,
      //               address: 1,
      //               vatNumber: 1,
      //               commercialNo: 1,
      //               bankAccount: 1,
      //               credit: 1,
      //               debit: 1,
      //             },
      //           },
      //         ],
      //         as: "customerx",
      //       },
      //     },
      //     { $addFields: { seller: { $arrayElemAt: ["$user", 0] } } },
      //     { $addFields: { customer: { $arrayElemAt: ["$customerx", 0] } } },

      //     { $project: { customerx: 0, user: 0, createdBy: 0 } },
      //   ]);
      //   return res.status(201).json({ order: _newOrder[0] });
      // } else {
      //   return next(
      //     new CustomError("This order don't created this is some error", 400)
      //   );
      // }

      // const fetchOrderByInvoiceNumber = asyncErorrHandeler(async (req, res, next) => {
      //   try {
      //     const order = await Order.aggregate([
      //       // Stage 1: Filter pizza order documents by pizza size
      //       {
      //         $match: {
      //           invoiceNumber: parseInt(req.query.invoiceNumber),
      //           isOrder: true,
      //         },
      //       },
      //       {
      //         $match: {
      //           invoiceNumber: parseInt(req.query.invoiceNumber),
      //           isOrder: true,
      //         },
      //       },
      //        {
      //           $addFields: {
      //             orderItems: {
      //               $map: {
      //                 input: "$items",
      //                 in: {
      //                   $mergeObjects: [
      //                     "$$this",
      //                     {
      //                       subTotal: {
      //                         $round: [
      //                           {
      //                             $multiply: ["$$this.price", "$$this.quantity"],
      //                           },
      //                           2,
      //                         ],
      //                       },
      //                     },
      //                     //total afterdiscount
      //                     {
      //                       subTotal2: {
      //                         $cond: [
      //                           { $eq: ["$priceIncludeTax", true] },
      //                           //true
      //                           {
      //                             $round: [
      //                               {
      //                                 $round: [
      //                                   {
      //                                     $divide: [
      //                                       {
      //                                         $subtract: [
      //                                           {
      //                                             $multiply: [
      //                                               "$$this.price",
      //                                               "$$this.quantity",
      //                                             ],
      //                                           },
      //                                           "$$this.discount",
      //                                         ],
      //                                       },
      //                                       {
      //                                         $add: [
      //                                           1,
      //                                           { $divide: ["$taxValue", 100] },
      //                                         ],
      //                                       },
      //                                     ],
      //                                   },
      //                                   2,
      //                                 ],
      //                               },
      //                               3,
      //                             ],
      //                           },
      //                           //fasle
      //                           {
      //                             $round: [
      //                               {
      //                                 $subtract: [
      //                                   {
      //                                     $multiply: [
      //                                       "$$this.price",
      //                                       "$$this.quantity",
      //                                     ],
      //                                   },
      //                                   "$$this.discount",
      //                                 ],
      //                               },
      //                               2,
      //                             ],
      //                           },
      //                         ],
      //                       },
      //                     },
      //                     //item tax
      //                     {
      //                       tax: {
      //                         $cond: [
      //                           { $eq: ["$priceIncludeTax", true] },
      //                           //true
      //                           {
      //                             $round: [
      //                               {
      //                                 $multiply: [
      //                                   {
      //                                     $divide: [
      //                                       {
      //                                         $round: [
      //                                           {
      //                                             $subtract: [
      //                                               {
      //                                                 $round: [
      //                                                   {
      //                                                     $multiply: [
      //                                                       "$$this.price",
      //                                                       "$$this.quantity",
      //                                                     ],
      //                                                   },
      //                                                   3,
      //                                                 ],
      //                                               },
      //                                               "$$this.discount",
      //                                             ],
      //                                           },
      //                                           3,
      //                                         ],
      //                                       },
      //                                       {
      //                                         $add: [
      //                                           1,
      //                                           { $divide: ["$taxValue", 100] },
      //                                         ],
      //                                       },
      //                                     ],
      //                                   },
      //                                   {
      //                                     $divide: ["$taxValue", 100],
      //                                   },
      //                                 ],
      //                               },
      //                               2,
      //                             ],
      //                           },
      //                           //false
      //                           {
      //                             $round: [
      //                               {
      //                                 $multiply: [
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $subtract: [
      //                                           {
      //                                             $round: [
      //                                               {
      //                                                 $multiply: [
      //                                                   "$$this.price",
      //                                                   "$$this.quantity",
      //                                                 ],
      //                                               },
      //                                               3,
      //                                             ],
      //                                           },
      //                                           "$$this.discount",
      //                                         ],
      //                                       },
      //                                       3,
      //                                     ],
      //                                   },
      //                                   {
      //                                     $divide: ["$taxValue", 100],
      //                                   },
      //                                 ],
      //                               },
      //                               2,
      //                             ],
      //                           },
      //                         ],
      //                       },
      //                     },
      //                     //item total
      //                     {
      //                       total: {
      //                         $round: [
      //                           {
      //                             $add: [
      //                               //item subtotal2
      //                               {
      //                                 $cond: [
      //                                   { $eq: ["$priceIncludeTax", true] },
      //                                   //true
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $round: [
      //                                           {
      //                                             $divide: [
      //                                               {
      //                                                 $subtract: [
      //                                                   {
      //                                                     $multiply: [
      //                                                       "$$this.price",
      //                                                       "$$this.quantity",
      //                                                     ],
      //                                                   },
      //                                                   "$$this.discount",
      //                                                 ],
      //                                               },
      //                                               {
      //                                                 $add: [
      //                                                   1,
      //                                                   {
      //                                                     $divide: ["$taxValue", 100],
      //                                                   },
      //                                                 ],
      //                                               },
      //                                             ],
      //                                           },
      //                                           2,
      //                                         ],
      //                                       },
      //                                       3,
      //                                     ],
      //                                   },
      //                                   //fasle
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $subtract: [
      //                                           {
      //                                             $multiply: [
      //                                               "$$this.price",
      //                                               "$$this.quantity",
      //                                             ],
      //                                           },
      //                                           "$$this.discount",
      //                                         ],
      //                                       },
      //                                       2,
      //                                     ],
      //                                   },
      //                                 ],
      //                               },
      //                               //item tax
      //                               {
      //                                 $cond: [
      //                                   { $eq: ["$priceIncludeTax", true] },
      //                                   //true
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $multiply: [
      //                                           {
      //                                             $divide: [
      //                                               {
      //                                                 $round: [
      //                                                   {
      //                                                     $subtract: [
      //                                                       {
      //                                                         $round: [
      //                                                           {
      //                                                             $multiply: [
      //                                                               "$$this.price",
      //                                                               "$$this.quantity",
      //                                                             ],
      //                                                           },
      //                                                           3,
      //                                                         ],
      //                                                       },
      //                                                       "$$this.discount",
      //                                                     ],
      //                                                   },
      //                                                   3,
      //                                                 ],
      //                                               },
      //                                               {
      //                                                 $add: [
      //                                                   1,
      //                                                   {
      //                                                     $divide: ["$taxValue", 100],
      //                                                   },
      //                                                 ],
      //                                               },
      //                                             ],
      //                                           },
      //                                           {
      //                                             $divide: ["$taxValue", 100],
      //                                           },
      //                                         ],
      //                                       },
      //                                       2,
      //                                     ],
      //                                   },
      //                                   //false
      //                                   {
      //                                     $round: [
      //                                       {
      //                                         $multiply: [
      //                                           {
      //                                             $round: [
      //                                               {
      //                                                 $subtract: [
      //                                                   {
      //                                                     $round: [
      //                                                       {
      //                                                         $multiply: [
      //                                                           "$$this.price",
      //                                                           "$$this.quantity",
      //                                                         ],
      //                                                       },
      //                                                       3,
      //                                                     ],
      //                                                   },
      //                                                   "$$this.discount",
      //                                                 ],
      //                                               },
      //                                               3,
      //                                             ],
      //                                           },
      //                                           {
      //                                             $divide: ["$taxValue", 100],
      //                                           },
      //                                         ],
      //                                       },
      //                                       2,
      //                                     ],
      //                                   },
      //                                 ],
      //                               },
      //                             ],
      //                           },
      //                           3,
      //                         ],
      //                       },
      //                     },
      //                   ],
      //                 },
      //               },
      //             },
      //           },
      //         },
      //         // lookup
      //         // products
      //         {
      //           $lookup: {
      //             from: "products",
      //             localField: "orderItems.productId", // field in the orders collection
      //             foreignField: "_id", // field in the items collection
      //             pipeline: [
      //               {
      //                 $project: {
      //                   _id: 1,
      //                   code: 1,
      //                   name: 1,
      //                   ar_name: 1,
      //                   cost: 1,
      //                 },
      //               },
      //             ],
      //             as: "product",
      //           },
      //         },
      //         {
      //           $project: {
      //             invoiceNumber: 1,
      //             customerId: 1,
      //             createdBy: 1,
      //             order_date: 1,
      //             order_time: 1,
      //             paid: 1,
      //             remaining: 1,
      //             paid1: 1,
      //             paid2: 1,
      //             paymentMethod1: 1,
      //             paymentMethod2: 1,
      //             isDiscount: 1,
      //             isOrder: 1,
      //             discountType: 1,
      //             discountValue: 1,
      //             priceIncludeTax: 1,
      //             taxValue: 1,
      //             saleNo: 1,
      //             status: 1,
      //             items: 1,
      //             items: {
      //               $map: {
      //                 input: "$orderItems",
      //                 as: "i",
      //                 in: {
      //                   $mergeObjects: [
      //                     "$$i",
      //                     {
      //                       $first: {
      //                         $filter: {
      //                           input: "$product",
      //                           cond: { $eq: ["$$this._id", "$$i.productId"] },
      //                         },
      //                       },
      //                     },
      //                   ],
      //                 },
      //               },
      //             },
      //           },
      //         },
      //         {
      //           $addFields: { orderQuantity: { $sum: "$items.quantity" } },
      //         },
      //         {
      //           $addFields: { orderSubTotal: { $sum: "$items.subTotal2" } },
      //         },
      //         {
      //           $addFields: {
      //             orderDiscount: {
      //               $cond: [
      //                 { $eq: ["$discountType", 1] },
      //                 // true
      //                 {
      //                   $round: [
      //                     {
      //                       $multiply: [
      //                         "$orderSubTotal",
      //                         { $divide: ["$discountValue", 100] },
      //                       ],
      //                     },
      //                     2,
      //                   ],
      //                 },
      //                 //false
      //                 "$discountValue",
      //               ],
      //             },
      //           },
      //         },
      //         {
      //           $addFields: {
      //             orderSubTotal2: {
      //               $round: [
      //                 {
      //                   $subtract: ["$orderSubTotal", "$orderDiscount"],
      //                 },
      //                 2,
      //               ],
      //             },
      //           },
      //         },
      //         {
      //           $addFields: {
      //             orderTax: {
      //               $cond: [
      //                 { $eq: ["$isDiscount", true] },
      //                 //true
      //                 {
      //                   $round: [
      //                     {
      //                       $multiply: [
      //                         "$orderSubTotal2",
      //                         { $divide: ["$taxValue", 100] },
      //                       ],
      //                     },
      //                     2,
      //                   ],
      //                 },
      //                 //false
      //                 { $sum: "$items.tax" },
      //               ],
      //             },
      //           },
      //         },
      //         {
      //           $addFields: {
      //             orderTotal: { $add: ["$orderSubTotal2", "$orderTax"] },
      //           },
      //         },
      //       //sellere
      //       {
      //         $lookup: {
      //           from: "users",
      //           localField: "createdBy", // field in the orders collection
      //           foreignField: "_id", // field in the items collection
      //           pipeline: [{ $project: { _id: 1, name: 1, role: 1, email: 1 } }],
      //           as: "user",
      //         },
      //       },
      //       // order customer
      //       {
      //         $lookup: {
      //           from: "customers",
      //           localField: "customerId", // field in the orders collection
      //           foreignField: "_id", // field in the items collection
      //           pipeline: [
      //             {
      //               $project: {
      //                 _id: 1,
      //                 code: 1,
      //                 name: 1,
      //                 email: 1,
      //                 phone: 1,
      //                 address: 1,
      //                 vatNumber: 1,
      //                 commercialNo: 1,
      //                 bankAccount: 1,
      //                 credit: 1,
      //                 debit: 1,
      //               },
      //             },
      //           ],
      //           as: "customerx",
      //         },
      //       },
      //       { $addFields: { seller: { $arrayElemAt: ["$user", 0] } } },
      //       { $addFields: { customer: { $arrayElemAt: ["$customerx", 0] } } },
      
      //       { $project: { customerx: 0, user: 0, createdBy: 0 } },
      //     ]);
      //     if (order.length !== 0) {
      //       return res.status(200).json({ order: order[0] });
      //     } else {
      //       return res
      //         .status(404)
      //         .json({ order: {}, msg: "No order exsist with this number" });
      //     }
      //   } catch (error) {
      //     return next(new CustomError(error.message, 400));
      //   }
      // });


      // const fetchOrderToReturn = asyncErorrHandeler(async (req, res, next) => {
//   try {
//     const returnOrder = await Order.aggregate([
//       // Stage 1: Filter pizza order documents by pizza size
//       {
//         $match: {
//           invoiceNumber: parseInt(req.query.invoiceNumber),
//           isOrder: true,
//         },
//       },
//      {
//           $addFields: {
//             orderItems: {
//               $map: {
//                 input: "$items",
//                 in: {
//                   $mergeObjects: [
//                     "$$this",
//                     {
//                       subTotal: {
//                         $round: [
//                           {
//                             $multiply: ["$$this.price", "$$this.quantity"],
//                           },
//                           2,
//                         ],
//                       },
//                     },
//                     //total afterdiscount
//                     {
//                       subTotal2: {
//                         $cond: [
//                           { $eq: ["$priceIncludeTax", true] },
//                           //true
//                           {
//                             $round: [
//                               {
//                                 $round: [
//                                   {
//                                     $divide: [
//                                       {
//                                         $subtract: [
//                                           {
//                                             $multiply: [
//                                               "$$this.price",
//                                               "$$this.quantity",
//                                             ],
//                                           },
//                                           "$$this.discount",
//                                         ],
//                                       },
//                                       {
//                                         $add: [
//                                           1,
//                                           { $divide: ["$taxValue", 100] },
//                                         ],
//                                       },
//                                     ],
//                                   },
//                                   2,
//                                 ],
//                               },
//                               3,
//                             ],
//                           },
//                           //fasle
//                           {
//                             $round: [
//                               {
//                                 $subtract: [
//                                   {
//                                     $multiply: [
//                                       "$$this.price",
//                                       "$$this.quantity",
//                                     ],
//                                   },
//                                   "$$this.discount",
//                                 ],
//                               },
//                               2,
//                             ],
//                           },
//                         ],
//                       },
//                     },
//                     //item tax
//                     {
//                       tax: {
//                         $cond: [
//                           { $eq: ["$priceIncludeTax", true] },
//                           //true
//                           {
//                             $round: [
//                               {
//                                 $multiply: [
//                                   {
//                                     $divide: [
//                                       {
//                                         $round: [
//                                           {
//                                             $subtract: [
//                                               {
//                                                 $round: [
//                                                   {
//                                                     $multiply: [
//                                                       "$$this.price",
//                                                       "$$this.quantity",
//                                                     ],
//                                                   },
//                                                   3,
//                                                 ],
//                                               },
//                                               "$$this.discount",
//                                             ],
//                                           },
//                                           3,
//                                         ],
//                                       },
//                                       {
//                                         $add: [
//                                           1,
//                                           { $divide: ["$taxValue", 100] },
//                                         ],
//                                       },
//                                     ],
//                                   },
//                                   {
//                                     $divide: ["$taxValue", 100],
//                                   },
//                                 ],
//                               },
//                               2,
//                             ],
//                           },
//                           //false
//                           {
//                             $round: [
//                               {
//                                 $multiply: [
//                                   {
//                                     $round: [
//                                       {
//                                         $subtract: [
//                                           {
//                                             $round: [
//                                               {
//                                                 $multiply: [
//                                                   "$$this.price",
//                                                   "$$this.quantity",
//                                                 ],
//                                               },
//                                               3,
//                                             ],
//                                           },
//                                           "$$this.discount",
//                                         ],
//                                       },
//                                       3,
//                                     ],
//                                   },
//                                   {
//                                     $divide: ["$taxValue", 100],
//                                   },
//                                 ],
//                               },
//                               2,
//                             ],
//                           },
//                         ],
//                       },
//                     },
//                     //item total
//                     {
//                       total: {
//                         $round: [
//                           {
//                             $add: [
//                               //item subtotal2
//                               {
//                                 $cond: [
//                                   { $eq: ["$priceIncludeTax", true] },
//                                   //true
//                                   {
//                                     $round: [
//                                       {
//                                         $round: [
//                                           {
//                                             $divide: [
//                                               {
//                                                 $subtract: [
//                                                   {
//                                                     $multiply: [
//                                                       "$$this.price",
//                                                       "$$this.quantity",
//                                                     ],
//                                                   },
//                                                   "$$this.discount",
//                                                 ],
//                                               },
//                                               {
//                                                 $add: [
//                                                   1,
//                                                   {
//                                                     $divide: ["$taxValue", 100],
//                                                   },
//                                                 ],
//                                               },
//                                             ],
//                                           },
//                                           2,
//                                         ],
//                                       },
//                                       3,
//                                     ],
//                                   },
//                                   //fasle
//                                   {
//                                     $round: [
//                                       {
//                                         $subtract: [
//                                           {
//                                             $multiply: [
//                                               "$$this.price",
//                                               "$$this.quantity",
//                                             ],
//                                           },
//                                           "$$this.discount",
//                                         ],
//                                       },
//                                       2,
//                                     ],
//                                   },
//                                 ],
//                               },
//                               //item tax
//                               {
//                                 $cond: [
//                                   { $eq: ["$priceIncludeTax", true] },
//                                   //true
//                                   {
//                                     $round: [
//                                       {
//                                         $multiply: [
//                                           {
//                                             $divide: [
//                                               {
//                                                 $round: [
//                                                   {
//                                                     $subtract: [
//                                                       {
//                                                         $round: [
//                                                           {
//                                                             $multiply: [
//                                                               "$$this.price",
//                                                               "$$this.quantity",
//                                                             ],
//                                                           },
//                                                           3,
//                                                         ],
//                                                       },
//                                                       "$$this.discount",
//                                                     ],
//                                                   },
//                                                   3,
//                                                 ],
//                                               },
//                                               {
//                                                 $add: [
//                                                   1,
//                                                   {
//                                                     $divide: ["$taxValue", 100],
//                                                   },
//                                                 ],
//                                               },
//                                             ],
//                                           },
//                                           {
//                                             $divide: ["$taxValue", 100],
//                                           },
//                                         ],
//                                       },
//                                       2,
//                                     ],
//                                   },
//                                   //false
//                                   {
//                                     $round: [
//                                       {
//                                         $multiply: [
//                                           {
//                                             $round: [
//                                               {
//                                                 $subtract: [
//                                                   {
//                                                     $round: [
//                                                       {
//                                                         $multiply: [
//                                                           "$$this.price",
//                                                           "$$this.quantity",
//                                                         ],
//                                                       },
//                                                       3,
//                                                     ],
//                                                   },
//                                                   "$$this.discount",
//                                                 ],
//                                               },
//                                               3,
//                                             ],
//                                           },
//                                           {
//                                             $divide: ["$taxValue", 100],
//                                           },
//                                         ],
//                                       },
//                                       2,
//                                     ],
//                                   },
//                                 ],
//                               },
//                             ],
//                           },
//                           3,
//                         ],
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         // lookup
//         // products
//         {
//           $lookup: {
//             from: "products",
//             localField: "orderItems.productId", // field in the orders collection
//             foreignField: "_id", // field in the items collection
//             pipeline: [
//               {
//                 $project: {
//                   _id: 1,
//                   code: 1,
//                   name: 1,
//                   ar_name: 1,
//                   cost: 1,
//                 },
//               },
//             ],
//             as: "product",
//           },
//         },
//         {
//           $project: {
//             invoiceNumber: 1,
//             customerId: 1,
//             createdBy: 1,
//             order_date: 1,
//             order_time: 1,
//             paid: 1,
//             remaining: 1,
//             paid1: 1,
//             paid2: 1,
//             paymentMethod1: 1,
//             paymentMethod2: 1,
//             isDiscount: 1,
//             isOrder: 1,
//             discountType: 1,
//             discountValue: 1,
//             priceIncludeTax: 1,
//             taxValue: 1,
//             saleNo: 1,
//             status: 1,
//             items: 1,
//             items: {
//               $map: {
//                 input: "$orderItems",
//                 as: "i",
//                 in: {
//                   $mergeObjects: [
//                     "$$i",
//                     {
//                       $first: {
//                         $filter: {
//                           input: "$product",
//                           cond: { $eq: ["$$this._id", "$$i.productId"] },
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         {
//           $addFields: { orderQuantity: { $sum: "$items.quantity" } },
//         },
//         {
//           $addFields: { orderSubTotal: { $sum: "$items.subTotal2" } },
//         },
//         {
//           $addFields: {
//             orderDiscount: {
//               $cond: [
//                 { $eq: ["$discountType", 1] },
//                 // true
//                 {
//                   $round: [
//                     {
//                       $multiply: [
//                         "$orderSubTotal",
//                         { $divide: ["$discountValue", 100] },
//                       ],
//                     },
//                     2,
//                   ],
//                 },
//                 //false
//                 "$discountValue",
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             orderSubTotal2: {
//               $round: [
//                 {
//                   $subtract: ["$orderSubTotal", "$orderDiscount"],
//                 },
//                 2,
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             orderTax: {
//               $cond: [
//                 { $eq: ["$isDiscount", true] },
//                 //true
//                 {
//                   $round: [
//                     {
//                       $multiply: [
//                         "$orderSubTotal2",
//                         { $divide: ["$taxValue", 100] },
//                       ],
//                     },
//                     2,
//                   ],
//                 },
//                 //false
//                 { $sum: "$items.tax" },
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             orderTotal: { $add: ["$orderSubTotal2", "$orderTax"] },
//           },
//         },
//       //sellere
//       {
//         $lookup: {
//           from: "users",
//           localField: "createdBy", // field in the orders collection
//           foreignField: "_id", // field in the items collection
//           pipeline: [{ $project: { _id: 1, name: 1, role: 1, email: 1 } }],
//           as: "user",
//         },
//       },
//       // order customer
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customerId", // field in the orders collection
//           foreignField: "_id", // field in the items collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 1,
//                 code: 1,
//                 name: 1,
//                 email: 1,
//                 phone: 1,
//                 address: 1,
//                 vatNumber: 1,
//                 commercialNo: 1,
//                 bankAccount: 1,
//                 credit: 1,
//                 debit: 1,
//               },
//             },
//           ],
//           as: "customerx",
//         },
//       },
//       { $addFields: { seller: { $arrayElemAt: ["$user", 0] } } },
//       { $addFields: { customer: { $arrayElemAt: ["$customerx", 0] } } },

//       { $project: { customerx: 0, user: 0, createdBy: 0 } },
//     ]);
//     if (returnOrder.length !== 0) {
//       returnOrder[0].items = returnOrder[0].items.map((item) => ({
//         ...item,
//         status: "",
//       }));
//       const orderItems = returnOrder[0].items.map((item) => ({
//         ...item,
//         status: "",
//       }));
//       //partially returned
//       const allRetunedItems = await Order.aggregate([
//         // Stage 1: Filter pizza order documents by pizza size
//         {
//           $match: {
//             saleNo: parseInt(req.query.invoiceNumber),
//             isOrder: false,
//           },
//         },
//          {
//           $addFields: {
//             orderItems: {
//               $map: {
//                 input: "$items",
//                 in: {
//                   $mergeObjects: [
//                     "$$this",
//                     {
//                       subTotal: {
//                         $round: [
//                           {
//                             $multiply: ["$$this.price", "$$this.quantity"],
//                           },
//                           2,
//                         ],
//                       },
//                     },
//                     //total afterdiscount
//                     {
//                       subTotal2: {
//                         $cond: [
//                           { $eq: ["$priceIncludeTax", true] },
//                           //true
//                           {
//                             $round: [
//                               {
//                                 $round: [
//                                   {
//                                     $divide: [
//                                       {
//                                         $subtract: [
//                                           {
//                                             $multiply: [
//                                               "$$this.price",
//                                               "$$this.quantity",
//                                             ],
//                                           },
//                                           "$$this.discount",
//                                         ],
//                                       },
//                                       {
//                                         $add: [
//                                           1,
//                                           { $divide: ["$taxValue", 100] },
//                                         ],
//                                       },
//                                     ],
//                                   },
//                                   2,
//                                 ],
//                               },
//                               3,
//                             ],
//                           },
//                           //fasle
//                           {
//                             $round: [
//                               {
//                                 $subtract: [
//                                   {
//                                     $multiply: [
//                                       "$$this.price",
//                                       "$$this.quantity",
//                                     ],
//                                   },
//                                   "$$this.discount",
//                                 ],
//                               },
//                               2,
//                             ],
//                           },
//                         ],
//                       },
//                     },
//                     //item tax
//                     {
//                       tax: {
//                         $cond: [
//                           { $eq: ["$priceIncludeTax", true] },
//                           //true
//                           {
//                             $round: [
//                               {
//                                 $multiply: [
//                                   {
//                                     $divide: [
//                                       {
//                                         $round: [
//                                           {
//                                             $subtract: [
//                                               {
//                                                 $round: [
//                                                   {
//                                                     $multiply: [
//                                                       "$$this.price",
//                                                       "$$this.quantity",
//                                                     ],
//                                                   },
//                                                   3,
//                                                 ],
//                                               },
//                                               "$$this.discount",
//                                             ],
//                                           },
//                                           3,
//                                         ],
//                                       },
//                                       {
//                                         $add: [
//                                           1,
//                                           { $divide: ["$taxValue", 100] },
//                                         ],
//                                       },
//                                     ],
//                                   },
//                                   {
//                                     $divide: ["$taxValue", 100],
//                                   },
//                                 ],
//                               },
//                               2,
//                             ],
//                           },
//                           //false
//                           {
//                             $round: [
//                               {
//                                 $multiply: [
//                                   {
//                                     $round: [
//                                       {
//                                         $subtract: [
//                                           {
//                                             $round: [
//                                               {
//                                                 $multiply: [
//                                                   "$$this.price",
//                                                   "$$this.quantity",
//                                                 ],
//                                               },
//                                               3,
//                                             ],
//                                           },
//                                           "$$this.discount",
//                                         ],
//                                       },
//                                       3,
//                                     ],
//                                   },
//                                   {
//                                     $divide: ["$taxValue", 100],
//                                   },
//                                 ],
//                               },
//                               2,
//                             ],
//                           },
//                         ],
//                       },
//                     },
//                     //item total
//                     {
//                       total: {
//                         $round: [
//                           {
//                             $add: [
//                               //item subtotal2
//                               {
//                                 $cond: [
//                                   { $eq: ["$priceIncludeTax", true] },
//                                   //true
//                                   {
//                                     $round: [
//                                       {
//                                         $round: [
//                                           {
//                                             $divide: [
//                                               {
//                                                 $subtract: [
//                                                   {
//                                                     $multiply: [
//                                                       "$$this.price",
//                                                       "$$this.quantity",
//                                                     ],
//                                                   },
//                                                   "$$this.discount",
//                                                 ],
//                                               },
//                                               {
//                                                 $add: [
//                                                   1,
//                                                   {
//                                                     $divide: ["$taxValue", 100],
//                                                   },
//                                                 ],
//                                               },
//                                             ],
//                                           },
//                                           2,
//                                         ],
//                                       },
//                                       3,
//                                     ],
//                                   },
//                                   //fasle
//                                   {
//                                     $round: [
//                                       {
//                                         $subtract: [
//                                           {
//                                             $multiply: [
//                                               "$$this.price",
//                                               "$$this.quantity",
//                                             ],
//                                           },
//                                           "$$this.discount",
//                                         ],
//                                       },
//                                       2,
//                                     ],
//                                   },
//                                 ],
//                               },
//                               //item tax
//                               {
//                                 $cond: [
//                                   { $eq: ["$priceIncludeTax", true] },
//                                   //true
//                                   {
//                                     $round: [
//                                       {
//                                         $multiply: [
//                                           {
//                                             $divide: [
//                                               {
//                                                 $round: [
//                                                   {
//                                                     $subtract: [
//                                                       {
//                                                         $round: [
//                                                           {
//                                                             $multiply: [
//                                                               "$$this.price",
//                                                               "$$this.quantity",
//                                                             ],
//                                                           },
//                                                           3,
//                                                         ],
//                                                       },
//                                                       "$$this.discount",
//                                                     ],
//                                                   },
//                                                   3,
//                                                 ],
//                                               },
//                                               {
//                                                 $add: [
//                                                   1,
//                                                   {
//                                                     $divide: ["$taxValue", 100],
//                                                   },
//                                                 ],
//                                               },
//                                             ],
//                                           },
//                                           {
//                                             $divide: ["$taxValue", 100],
//                                           },
//                                         ],
//                                       },
//                                       2,
//                                     ],
//                                   },
//                                   //false
//                                   {
//                                     $round: [
//                                       {
//                                         $multiply: [
//                                           {
//                                             $round: [
//                                               {
//                                                 $subtract: [
//                                                   {
//                                                     $round: [
//                                                       {
//                                                         $multiply: [
//                                                           "$$this.price",
//                                                           "$$this.quantity",
//                                                         ],
//                                                       },
//                                                       3,
//                                                     ],
//                                                   },
//                                                   "$$this.discount",
//                                                 ],
//                                               },
//                                               3,
//                                             ],
//                                           },
//                                           {
//                                             $divide: ["$taxValue", 100],
//                                           },
//                                         ],
//                                       },
//                                       2,
//                                     ],
//                                   },
//                                 ],
//                               },
//                             ],
//                           },
//                           3,
//                         ],
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         // lookup
//         // products
//         {
//           $lookup: {
//             from: "products",
//             localField: "orderItems.productId", // field in the orders collection
//             foreignField: "_id", // field in the items collection
//             pipeline: [
//               {
//                 $project: {
//                   _id: 1,
//                   code: 1,
//                   name: 1,
//                   ar_name: 1,
//                   cost: 1,
//                 },
//               },
//             ],
//             as: "product",
//           },
//         },
//         {
//           $project: {
//             invoiceNumber: 1,
//             customerId: 1,
//             createdBy: 1,
//             order_date: 1,
//             order_time: 1,
//             paid: 1,
//             remaining: 1,
//             paid1: 1,
//             paid2: 1,
//             paymentMethod1: 1,
//             paymentMethod2: 1,
//             isDiscount: 1,
//             isOrder: 1,
//             discountType: 1,
//             discountValue: 1,
//             priceIncludeTax: 1,
//             taxValue: 1,
//             saleNo: 1,
//             status: 1,
//             items: 1,
//             items: {
//               $map: {
//                 input: "$orderItems",
//                 as: "i",
//                 in: {
//                   $mergeObjects: [
//                     "$$i",
//                     {
//                       $first: {
//                         $filter: {
//                           input: "$product",
//                           cond: { $eq: ["$$this._id", "$$i.productId"] },
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         {
//           $addFields: { orderQuantity: { $sum: "$items.quantity" } },
//         },
//         {
//           $addFields: { orderSubTotal: { $sum: "$items.subTotal2" } },
//         },
//         {
//           $addFields: {
//             orderDiscount: {
//               $cond: [
//                 { $eq: ["$discountType", 1] },
//                 // true
//                 {
//                   $round: [
//                     {
//                       $multiply: [
//                         "$orderSubTotal",
//                         { $divide: ["$discountValue", 100] },
//                       ],
//                     },
//                     2,
//                   ],
//                 },
//                 //false
//                 "$discountValue",
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             orderSubTotal2: {
//               $round: [
//                 {
//                   $subtract: ["$orderSubTotal", "$orderDiscount"],
//                 },
//                 2,
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             orderTax: {
//               $cond: [
//                 { $eq: ["$isDiscount", true] },
//                 //true
//                 {
//                   $round: [
//                     {
//                       $multiply: [
//                         "$orderSubTotal2",
//                         { $divide: ["$taxValue", 100] },
//                       ],
//                     },
//                     2,
//                   ],
//                 },
//                 //false
//                 { $sum: "$items.tax" },
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             orderTotal: { $add: ["$orderSubTotal2", "$orderTax"] },
//           },
//         },
//         //// unwind////////////
//         { $unwind: "$items" },

//         {
//           $group: {
//             _id: "$items.productId",
//             quantity: { $sum: "$items.quantity" },
//             price: { $first: "$items.price" },
//             name: { $first: "$items.name" },
//             ar_name: { $first: "$items.ar_name" },
//             code: { $first: "$items.code" },
//             count: { $sum: 1 },
//           },
//         },
//         //sellere
//         {
//           $lookup: {
//             from: "users",
//             localField: "createdBy", // field in the orders collection
//             foreignField: "_id", // field in the items collection
//             pipeline: [{ $project: { _id: 1, name: 1, role: 1, email: 1 } }],
//             as: "user",
//           },
//         },
//         // order customer
//         {
//           $lookup: {
//             from: "customers",
//             localField: "customerId", // field in the orders collection
//             foreignField: "_id", // field in the items collection
//             pipeline: [
//               {
//                 $project: {
//                   _id: 1,
//                   code: 1,
//                   name: 1,
//                   email: 1,
//                   phone: 1,
//                   address: 1,
//                   vatNumber: 1,
//                   commercialNo: 1,
//                   bankAccount: 1,
//                   credit: 1,
//                   debit: 1,
//                 },
//               },
//             ],
//             as: "customerx",
//           },
//         },
//         { $addFields: { seller: { $arrayElemAt: ["$user", 0] } } },
//         { $addFields: { customer: { $arrayElemAt: ["$customerx", 0] } } },
//         { $project: { customerx: 0, user: 0, createdBy: 0 } },
//       ]);
//       const {
//         _id,
//         invoiceNumber,
//         customer,
//         seller,
//         priceIncludeTax,
//         taxValue,
//         isDiscount,
//         discountType,
//         discountValue,
//       } = returnOrder[0];
//       if (allRetunedItems.length > 0) {
//         // check item exsist in invoiceOrderItems
//         const arr = [];
//         let newItem = {};
//         orderItems.forEach((p) => {
//           if (!allRetunedItems.includes(allRetunedItems.find(item=>item._id.toString() === p.productId.toString()))) {
//             arr.push(p);
//           } 
//           else {
//             allRetunedItems.forEach((rp) => {
//               if (
//                 p.productId.toString() === rp._id.toString() &&
//                 rp.quantity === p.quantity
//               ) {
//                 p.status = "full";
//                 arr.push(p);
//               } else if (
//                 p.productId.toString() === rp._id.toString() &&
//                 rp.quantity < p.quantity
//               ) {
//                 p.quantity -= rp.quantity;
//                 newItem = {
//                   _id: p.productId,
//                   productId: p.productId,
//                   categoryId: p.categoryId,
//                   unitId: p.unitId,
//                   name: p.name,
//                   ar_name: p.ar_name,
//                   price: p.price,
//                   code: p.code,
//                   cost: p.cost,
//                   quantity: p.quantity,
//                   discount: p.discount,
//                   subTotal: p.quantity * p.price,
//                   isorder: false,
//                   status: "partial",
//                   subTotal2: priceIncludeTax
//                     ? roundNumber(
//                         (p.quantity * p.price - p.discount) /
//                           (1 + taxValue / 100)
//                       )
//                     : roundIntger(p.quantity * p.price - p.discount),
//                   tax: priceIncludeTax
//                     ? roundNumber(
//                         ((p.quantity * p.price - p.discount) /
//                           (1 + taxValue / 100)) *
//                           (taxValue / 100)
//                       )
//                     : roundNumber(
//                         (p.quantity * p.price - p.discount) * (taxValue / 100)
//                       ),
//                   total: priceIncludeTax
//                     ? roundNumber(
//                         (p.quantity * p.price - p.discount) /
//                           (1 + taxValue / 100)
//                       ) +
//                       roundNumber(
//                         ((p.quantity * p.price - p.discount) /
//                           (1 + taxValue / 100)) *
//                           (taxValue / 100)
//                       )
//                     : roundIntger(p.quantity * p.price - p.discount) +
//                       roundNumber(
//                         (p.quantity * p.price - p.discount) * (taxValue / 100)
//                       ),
//                 };
//                 arr.push(newItem);
//               }
//             });
//           }
//         });
//         const rOrder = {
//           _id,
//           invoiceNumber,
//           customer,
//           seller,
//           priceIncludeTax,
//           taxValue,
//           items: arr,
//           isDiscount,
//           discountType,
//           discountValue,
//           orderQuantity: arr.reduce((a, b) => a + parseInt(b.quantity), 0),
//         };
//         return res.status(200).json({ rOrder });
//       } else {
//         return res.status(200).json({ rOrder: returnOrder[0] });
//       }
//     } else {
//       return res
//         .status(404)
//         .json({ order: {}, msg: "No order exsist with this number" });
//     }
//   } catch (error) {
//     return next(new CustomError(error.message, 400));
//   }
// });