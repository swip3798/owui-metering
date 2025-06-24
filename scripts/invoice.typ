#set page(width: 210mm, height: 297mm, margin: 2cm)
#let inputs= (
  userid: "5a7d3a55-a8d5-4497-a5a9-438144e5dbc4",
  username: "techpioneer92",
  email: "user@example.com",
  month: "5",
  year: "2025",
  tablecontent: "[\"GPT-4\", 1000, 500, 0.06, \"Claude 3 Opus\", 1500, 300, 0.045, \"Llama 3 70B\", 2000, 1000, 0.04, \"Gemini Pro\", 1200, 600, 0.035, \"Mixtral 8x7B\", 1800, 800, 0.03]",
  total_amount: "30.40",
  footer: "Please pay the costs quickly. I appreciate it very much! The additional total cost due comes from running the chat service.",
)
#if sys.inputs.len() != 0 {
  inputs = sys.inputs
}

#rect[
  #set text(12pt)
  #grid(
    columns: (1fr, 1fr),
    gutter: 1cm,
    [
      #strong[Open WebUI Metering]\
    ],
    [
      #align(right, text(size: 24pt, weight: "bold")[COST REPORT])\
      #set par(justify: true)
      Date: #datetime.today().display()\
    ]
  )
]
Costs are calculated through IEEE floating point numbers. Slight imprecisions are to be expected.

// Separator
#line(length: 100%, stroke: 0.5pt)

// Billing Information
#v(1cm)
#set text(10pt)
#grid(
  columns: (1fr, 1fr),
  column-gutter: 1cm,
  [
    #strong[Costs of:]\
    UserID: #strong[#inputs.at("userid")]\
    Username: #strong[#inputs.at("username")]\
    Email: #strong[#inputs.at("email")]
  ],
  [
    #align(right)[
      #strong[Service Period:]\
      June, 2025
    ]
  ]
)
#set table(
  stroke: none,
  gutter: 0.2em,
  fill: (x, y) =>
    if y == 0 { blue } else {silver},
  inset: (right: 1.5em),
)
#show table.cell: it => {
  if it.y == 0 {
    set text(white)
    strong(it)
  } else if it.body == [] {
    // Replace empty cells with 'N/A'
    pad(..it.inset)[_N/A_]
  } else {
    it
  }
}

// Main Content
#v(1cm)
#table(
  columns: (3fr, 1.5fr, 1.5fr, 2fr),
  align: horizon,
  table.header([Model], [Input Token], [Output Token], [Total cost]),
  ..for col in json(bytes(inputs.at("tablecontent"))) {
    ([#col],)
  }
)

// Total Section
#v(1cm)
#set align(right)
#set text(12pt)
#rect(
    inset: 8pt,
    fill: rgb("f8f8f8"),
    radius: 4pt,
    [
      Total Amount Due: #strong[\$#inputs.at("total_amount")]
    ]
)
#set align(left)


// Footer
#v(1.5cm)
#set text(8pt)
#align(center)[
  #inputs.at("footer")
]
