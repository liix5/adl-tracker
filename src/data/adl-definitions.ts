import type { ADLType } from "@/db/types";

export interface ADLStep {
  id: string;
  name: string;
  description?: string;
  weight?: number; // For bathing: each body part = 10%
}

export interface ConfigOption {
  id: string;
  name: string; // e.g., "T-shirt", "Bra"
  steps: ADLStep[]; // Steps for this option
}

export interface ADLDefinition {
  type: ADLType;
  name: string;
  category: "selfCare" | "transfers" | "locomotion";
  description: string;

  // Fixed steps (most ADLs)
  steps?: ADLStep[];

  // OR configurable steps (dressing)
  configurableSteps?: {
    options: ConfigOption[];
  };
}

// =============================================================================
// SELF-CARE (6 ADLs)
// =============================================================================

const eating: ADLDefinition = {
  type: "eating",
  name: "Eating",
  category: "selfCare",
  description: "Use utensils to bring food/liquid to mouth, chew, and swallow",
  steps: [
    {
      id: "use-utensils",
      name: "Use utensils to pick up food",
      description:
        " including cutlery, or hand if culturally appropriate, patient might use modified tools or utensils ",
    },
    { id: "bring-to-mouth", name: "Bring food to mouth" },
    {
      id: "chew-swallow",
      name: "Chew and swallow",
      description: "Managing a variety of food consistencies",
    },
    { id: "drinking", name: "Drinking from a cup or glass" },
  ],
};

const grooming: ADLDefinition = {
  type: "grooming",
  name: "Grooming",
  category: "selfCare",
  description:
    "Select which grooming tasks the patient performs, then mark which they can do independently",
  configurableSteps: {
    options: [
      {
        id: "oral-care",
        name: "Oral Care",
        steps: [{ id: "oral-care", name: "Brush teeth or care for dentures" }],
      },
      {
        id: "hair-grooming",
        name: "Hair Grooming",
        steps: [{ id: "hair-grooming", name: "Brush or comb hair" }],
      },
      {
        id: "wash-face",
        name: "Wash Face",
        steps: [{ id: "wash-face", name: "Wash, rinse, and dry face" }],
      },
      {
        id: "wash-hands",
        name: "Wash Hands",
        steps: [{ id: "wash-hands", name: "Wash, rinse, and dry hands" }],
      },
      {
        id: "shaving",
        name: "Shaving",
        steps: [{ id: "shaving", name: "Shave face" }],
      },
      {
        id: "makeup",
        name: "Makeup",
        steps: [{ id: "makeup", name: "Apply makeup" }],
      },
    ],
  },
};

const bathing: ADLDefinition = {
  type: "bathing",
  name: "Bathing",
  category: "selfCare",
  description: "Wash and dry body from neck down (excluding back)",
  steps: [
    // Trunk
    {
      id: "trunk-chest",
      name: "Wash/dry chest",
      weight: 10,
    },
    {
      id: "trunk-abdomen",
      name: "Wash/dry abdomen",
      weight: 10,
    },
    // Perineum
    {
      id: "perineum-front",
      name: "Wash/dry perineum (front)",
      weight: 10,
    },
    {
      id: "perineum-back",
      name: "Wash/dry perineum (back)",
      weight: 10,
    },
    // Left side
    {
      id: "left-arm",
      name: "Wash/dry left arm",
      weight: 10,
    },
    {
      id: "left-upper-leg",
      name: "Wash/dry left upper leg",
      weight: 10,
    },
    {
      id: "left-lower-leg-foot",
      name: "Wash/dry left lower leg and foot",
      weight: 10,
    },
    // Right side
    {
      id: "right-arm",
      name: "Wash/dry right arm",
      weight: 10,
    },
    {
      id: "right-upper-leg",
      name: "Wash/dry right upper leg",
      weight: 10,
    },
    {
      id: "right-lower-leg-foot",
      name: "Wash/dry right lower leg and foot",
      weight: 10,
    },
  ],
};

const dressingUpper: ADLDefinition = {
  type: "dressingUpper",
  name: "Dressing - Upper Body",
  category: "selfCare",
  description: "Dress/undress above the waist, including prosthetics/orthosis",
  configurableSteps: {
    options: [
      {
        id: "tshirt",
        name: "Shirt",
        steps: [
          {
            id: "tshirt-dress-right-sleeve",
            name: "Dressing: Threading right sleeve",
          },
          {
            id: "tshirt-dress-left-sleeve",
            name: "Dressing: Threading left sleeve",
          },
          {
            id: "tshirt-dress-head",
            name: "Dressing: Pulling the head through neckline",
          },
          {
            id: "tshirt-dress-trunk",
            name: "Dressing: Pulling the shirt over the trunk",
          },
          {
            id: "tshirt-undress-trunk",
            name: "Undressing: Pulling the shirt over the trunk",
          },
          {
            id: "tshirt-undress-right-sleeve",
            name: "Undressing: Unthreading right sleeve",
          },
          {
            id: "tshirt-undress-left-sleeve",
            name: "Undressing: Unthreading left sleeve",
          },
          {
            id: "tshirt-undress-head",
            name: "Undressing: Pulling the head through neckline",
          },
        ],
      },
      {
        id: "button-shirt",
        name: "Front-Buttoned/Zipping Shirt",
        steps: [
          {
            id: "button-dress-right-sleeve",
            name: "Dressing: Threading right sleeve",
          },
          {
            id: "button-dress-back",
            name: "Dressing: Pulling item around the back",
          },
          {
            id: "button-dress-left-sleeve",
            name: "Dressing: Threading left sleeve",
          },
          {
            id: "button-dress-fasten",
            name: "Dressing: Buttoning or zipping the shirt",
          },
          {
            id: "button-undress-unfasten",
            name: "Undressing: Unbuttoning or unzipping the shirt",
          },
          {
            id: "button-undress-right-sleeve",
            name: "Undressing: Unthreading right sleeve",
          },
          {
            id: "button-undress-back",
            name: "Undressing: Pulling item around the back",
          },
          {
            id: "button-undress-left-sleeve",
            name: "Undressing: Unthreading left sleeve",
          },
        ],
      },
      {
        id: "bra-back-hook",
        name: "Bra - Hooked in Back",
        steps: [
          {
            id: "bra3-dress-right-strap",
            name: "Dressing: Threading right bra strap",
          },
          {
            id: "bra3-dress-left-strap",
            name: "Dressing: Threading left bra strap",
          },
          { id: "bra3-dress-hook", name: "Dressing: Hooking bra" },
          { id: "bra3-undress-unhook", name: "Undressing: Unhooking bra" },
          {
            id: "bra3-undress-right-strap",
            name: "Undressing: Unthreading right bra strap",
          },
          {
            id: "bra3-undress-left-strap",
            name: "Undressing: Unthreading left bra strap",
          },
        ],
      },
      {
        id: "bra-front-hook",
        name: "Bra - Hooked in Front",
        steps: [
          {
            id: "bra4-dress-hook-front",
            name: "Dressing: Hooking bra in front",
          },
          {
            id: "bra4-dress-twist-back",
            name: "Dressing: Twisting bra until hook is back",
          },
          {
            id: "bra4-dress-right-arm",
            name: "Dressing: Threading right arm into strap",
          },
          {
            id: "bra4-dress-left-arm",
            name: "Dressing: Threading left arm into strap",
          },
          {
            id: "bra4-undress-right-arm",
            name: "Undressing: Unthreading right arm of strap",
          },
          {
            id: "bra4-undress-left-arm",
            name: "Undressing: Unthreading left arm of strap",
          },
          {
            id: "bra4-undress-twist-front",
            name: "Undressing: Twisting bra until hook is front",
          },
          {
            id: "bra4-undress-unhook-front",
            name: "Undressing: Unhooking bra in front",
          },
        ],
      },
      {
        id: "upper-prosthesis",
        name: "Upper Limb Prosthesis (e.g., artificial arm/hand)",
        steps: [
          { id: "upper-prosthesis-don", name: "Applying prosthesis" },
          { id: "upper-prosthesis-doff", name: "Removing prosthesis" },
        ],
      },
      {
        id: "upper-orthosis",
        name: "Upper Body Orthosis (e.g., splint, sling, brace)",
        steps: [
          { id: "upper-orthosis-don", name: "Applying orthosis" },
          { id: "upper-orthosis-doff", name: "Removing orthosis" },
        ],
      },
    ],
  },
};

const dressingLower: ADLDefinition = {
  type: "dressingLower",
  name: "Dressing - Lower Body",
  category: "selfCare",
  description: "Dress/undress below the waist, including prosthetics/orthosis",
  configurableSteps: {
    options: [
      {
        id: "socks",
        name: "Socks",
        steps: [
          { id: "socks-dress-right", name: "Dressing: Put on right sock" },
          { id: "socks-dress-left", name: "Dressing: Put on left sock" },
          { id: "socks-undress-right", name: "Undressing: Remove right sock" },
          { id: "socks-undress-left", name: "Undressing: Remove left sock" },
        ],
      },
      {
        id: "pants-buttoned-zippers",
        name: "Pants/Trousers (Buttoned/Zippers)",
        steps: [
          {
            id: "pants-bz-dress-right-leg",
            name: "Dressing: Threading right leg",
          },
          {
            id: "pants-bz-dress-left-leg",
            name: "Dressing: Threading left leg",
          },
          {
            id: "pants-bz-dress-pull-up",
            name: "Dressing: Pulling up over hips",
          },
          { id: "pants-bz-dress-zip", name: "Dressing: Zipping the pants" },
          {
            id: "pants-bz-undress-unzip",
            name: "Undressing: Unzipping the pants",
          },
          {
            id: "pants-bz-undress-pull-down",
            name: "Undressing: Pulling down over hips",
          },
          {
            id: "pants-bz-undress-right-leg",
            name: "Undressing: Unthreading right leg",
          },
          {
            id: "pants-bz-undress-left-leg",
            name: "Undressing: Unthreading left leg",
          },
        ],
      },
      {
        id: "pants-elastic-waistband",
        name: "Pants/Trousers/Underwear (Elastic Waistband)",
        steps: [
          {
            id: "pants-ew-dress-right-leg",
            name: "Dressing: Threading right leg",
          },
          {
            id: "pants-ew-dress-left-leg",
            name: "Dressing: Threading left leg",
          },
          {
            id: "pants-ew-dress-pull-up",
            name: "Dressing: Pulling up over hips",
          },
          {
            id: "pants-ew-undress-pull-down",
            name: "Undressing: Pulling down over hips",
          },
          {
            id: "pants-ew-undress-right-leg",
            name: "Undressing: Unthreading right leg",
          },
          {
            id: "pants-ew-undress-left-leg",
            name: "Undressing: Unthreading left leg",
          },
        ],
      },
      {
        id: "shoes-slip-on",
        name: "Slip-on Shoes",
        steps: [
          { id: "shoes-so-dress-right", name: "Dressing: Put on right shoe" },
          { id: "shoes-so-dress-left", name: "Dressing: Put on left shoe" },
          {
            id: "shoes-so-undress-right",
            name: "Undressing: Remove right shoe",
          },
          { id: "shoes-so-undress-left", name: "Undressing: Remove left shoe" },
        ],
      },
      {
        id: "shoes-lace-up",
        name: "Lace-up Shoes",
        steps: [
          {
            id: "shoes-lu-dress-right-shoe",
            name: "Dressing: Put on right shoe",
          },
          {
            id: "shoes-lu-dress-left-shoe",
            name: "Dressing: Put on left shoe",
          },
          {
            id: "shoes-lu-dress-tie-right",
            name: "Dressing: Tying or buckling right shoe",
          },
          {
            id: "shoes-lu-dress-tie-left",
            name: "Dressing: Tying or buckling left shoe",
          },
          {
            id: "shoes-lu-undress-untie-right",
            name: "Undressing: Untying or unbuckling right shoe",
          },
          {
            id: "shoes-lu-undress-untie-left",
            name: "Undressing: Untying or unbuckling left shoe",
          },
          {
            id: "shoes-lu-undress-right-shoe",
            name: "Undressing: Remove right shoe",
          },
          {
            id: "shoes-lu-undress-left-shoe",
            name: "Undressing: Remove left shoe",
          },
        ],
      },
      {
        id: "lower-prosthesis",
        name: "Lower Limb Prosthesis (e.g., artificial leg/foot)",
        steps: [
          { id: "lower-prosthesis-don", name: "Applying prosthesis" },
          { id: "lower-prosthesis-doff", name: "Removing prosthesis" },
        ],
      },
      {
        id: "lower-orthosis",
        name: "Lower Body Orthosis (e.g., AFO, knee brace)",
        steps: [
          { id: "lower-orthosis-don", name: "Applying orthosis" },
          { id: "lower-orthosis-doff", name: "Removing orthosis" },
        ],
      },
    ],
  },
};

const toileting: ADLDefinition = {
  type: "toileting",
  name: "Toileting",
  category: "selfCare",
  description:
    "Maintain perineal hygiene and adjust clothing before/after toilet",
  steps: [
    {
      id: "clothing-before",
      name: "Adjust clothing before toileting",
      description:
        "including before commode, bedpan, or urinal after a continent episode.",
    },
    {
      id: "perineal-hygiene",
      name: "Maintain perineal hygiene (sanitary care)",
    },
    {
      id: "clothing-after",
      name: "Readjust clothing after toileting",
      description:
        "including after commode, bedpan, or urinal after a continent episode.",
    },
  ],
};

// =============================================================================
// TRANSFERS (3 ADLs)
// =============================================================================

const transferBedChair: ADLDefinition = {
  type: "transferBedChair",
  name: "Bed/Chair/Wheelchair Transfer",
  category: "transfers",
  description: "Move to/from bed, chair, or wheelchair",
  configurableSteps: {
    options: [
      {
        id: "bed-chair-walking",
        name: "Walking",
        steps: [
          { id: "walking-approach-bed-chair", name: "Approach bed/chair" },
          {
            id: "walking-sit-transfer-bed-chair",
            name: "Sit down/transfer into bed or chair",
          },
          {
            id: "walking-stand-up-bed-chair",
            name: "Get up to standing position",
          },
        ],
      },
      {
        id: "bed-chair-wheelchair",
        name: "Wheelchair",
        steps: [
          { id: "wc-approach-bed-chair", name: "Approach bed/chair" },
          { id: "wc-lock-brakes-bed-chair", name: "Lock brakes" },
          { id: "wc-lift-footrests-bed-chair", name: "Lift foot rests" },
          {
            id: "wc-remove-armrests-bed-chair",
            name: "Remove arm rests if necessary",
          },
          {
            id: "wc-transfer-bed-chair",
            name: "Perform standing pivot or sliding transfer",
          },
          { id: "wc-return-bed-chair", name: "Return (transfer back)" },
        ],
      },
    ],
  },
};

const transferToilet: ADLDefinition = {
  type: "transferToilet",
  name: "Toilet Transfer",
  category: "transfers",
  description: "Get on/off toilet",
  configurableSteps: {
    options: [
      {
        id: "toilet-walking",
        name: "Walking",
        steps: [
          { id: "walking-approach-toilet", name: "Approach toilet" },
          { id: "walking-sit-toilet", name: "Sit down on toilet" },
          { id: "walking-stand-toilet", name: "Get up from toilet" },
        ],
      },
      {
        id: "toilet-wheelchair",
        name: "Wheelchair",
        steps: [
          { id: "wc-approach-toilet", name: "Approach toilet" },
          { id: "wc-lock-brakes-toilet", name: "Lock brakes" },
          { id: "wc-lift-footrests-toilet", name: "Lift foot rests" },
          {
            id: "wc-remove-armrests-toilet",
            name: "Remove arm rests if necessary",
          },
          {
            id: "wc-transfer-toilet",
            name: "Perform standing pivot or sliding transfer",
          },
          { id: "wc-return-toilet", name: "Return (transfer back)" },
        ],
      },
    ],
  },
};

const transferBathShower: ADLDefinition = {
  type: "transferBathShower",
  name: "Tub/Shower Transfer",
  category: "transfers",
  description: "Get in/out of tub or shower",
  configurableSteps: {
    options: [
      {
        id: "bath-shower-walking",
        name: "Walking",
        steps: [
          { id: "walking-approach-bath", name: "Approach tub/shower" },
          { id: "walking-enter-bath", name: "Get into tub/shower" },
          { id: "walking-exit-bath", name: "Get out of tub/shower" },
        ],
      },
      {
        id: "bath-shower-wheelchair",
        name: "Wheelchair",
        steps: [
          { id: "wc-approach-bath", name: "Approach tub/shower" },
          { id: "wc-lock-brakes-bath", name: "Lock brakes" },
          { id: "wc-lift-footrests-bath", name: "Lift foot rests" },
          {
            id: "wc-remove-armrests-bath",
            name: "Remove arm rests if necessary",
          },
          {
            id: "wc-transfer-bath",
            name: "Perform standing pivot or sliding transfer",
          },
          { id: "wc-return-bath", name: "Return (transfer back)" },
        ],
      },
    ],
  },
};

// =============================================================================
// LOCOMOTION (2 ADLs)
// =============================================================================

const locomotionWalkWheelchair: ADLDefinition = {
  type: "locomotionWalkWheelchair",
  name: "Walk/Wheelchair",
  category: "locomotion",
  description: "Walk or propel wheelchair for 50 metres on a level surface",
  steps: [
    {
      id: "walk-or-propel-50m",
      name: "Walk or propel wheelchair for 50 metres on a level surface",
    },
  ],
};

// =============================================================================
// EXPORTS
// =============================================================================

export const ADL_DEFINITIONS: readonly ADLDefinition[] = [
  // Self-Care (6)
  eating,
  grooming,
  bathing,
  dressingUpper,
  dressingLower,
  toileting,
  // Transfers (3)
  transferBedChair,
  transferToilet,
  transferBathShower,
  // Locomotion (1)
  locomotionWalkWheelchair,
] as const;

export const ADL_DEFINITIONS_MAP = Object.fromEntries(
  ADL_DEFINITIONS.map((def) => [def.type, def]),
) as Record<ADLType, ADLDefinition>;

// Helper to get ADL by type
export function getADLDefinition(type: ADLType): ADLDefinition {
  return ADL_DEFINITIONS_MAP[type];
}

// Helper to get category display name
export function getCategoryName(
  category: "selfCare" | "transfers" | "locomotion",
): string {
  const names = {
    selfCare: "Self-Care",
    transfers: "Transfers",
    locomotion: "Locomotion",
  };
  return names[category];
}

// Helper to get all ADL types by category
export function getADLsByCategory(
  category: "selfCare" | "transfers" | "locomotion",
): ADLDefinition[] {
  return ADL_DEFINITIONS.filter((def) => def.category === category);
}
