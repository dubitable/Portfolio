export const NAMEMAP = {
  logos: "Logo",
  Short_Conference_Name: "Conf.",
  Full_Team_Name: "Team",
  Net_Rating: "NTG",
  Adjusted_Offensive_Efficiency: "AdjOE",
  Adjusted_Defensive_Efficiency: "AdjDE",
  Raw_Offensive_Efficiency: "OE",
  Raw_Defensive_Efficiency: "DE",
  Adjusted_Tempo: "AdjTmp",
  Raw_Tempo: "Tmp",
  eFGPct: "eFG%",
  FG2Pct: "2FG%",
  FG3Pct: "3FG%",
  FTPct: "FT%",
  TOPct: "TO%",
  BlockPct: "Blk%",
  OppFG2Pct: "O2FG%",
  OppFG3Pct: "O3FG%",
  OppFTPct: "OFT%",
  OppBlockPct: "OBlk%",
  CenterOR: "COR",
  CenterDR: "CDR",
  CenterPts: "CPts",
  AvgHeight: "AvgHgt",
  EffectiveHeight: "EffHgt",
};

export const applyNAMEMAP = (column: string) => {
  if (column in NAMEMAP) return NAMEMAP[column as keyof typeof NAMEMAP];
  return column;
};

export const DATASELECT = {
  REDUCED: {
    Tournament_Winner_: true,
    Mapped_ESPN_Team_Name: true,
    logos: true,
    Season: true,
    Full_Team_Name: true,
    Short_Conference_Name: true,
    Net_Rating: true,
    Adjusted_Offensive_Efficiency: true,
    Adjusted_Defensive_Efficiency: true,
    Adjusted_Tempo: true,
  },
  FULL: {
    Tournament_Winner_: true,
    Mapped_ESPN_Team_Name: true,
    logos: true,

    Season: true,
    Full_Team_Name: true,
    Short_Conference_Name: true,

    Net_Rating: true,

    Adjusted_Offensive_Efficiency: true,
    Adjusted_Defensive_Efficiency: true,
    Adjusted_Tempo: true,

    Raw_Offensive_Efficiency: true,
    Raw_Defensive_Efficiency: true,
    Raw_Tempo: true,

    eFGPct: true,
    FG2Pct: true,
    FG3Pct: true,
    FTPct: true,

    TOPct: true,
    BlockPct: true,

    OppFG2Pct: true,
    OppFG3Pct: true,
    OppFTPct: true,

    OppBlockPct: true,

    PGOR: true,
    SGOR: true,
    SFOR: true,
    PFOR: true,
    CenterOR: true,

    PGDR: true,
    SGDR: true,
    SFDR: true,
    PFDR: true,
    CenterDR: true,

    Bench: true,

    AvgHeight: true,
    EffectiveHeight: true,
  },
};
