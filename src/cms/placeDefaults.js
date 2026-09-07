import illustration1 from "../assets/images/illustration.jpeg";
import illustration2 from "../assets/images/illustration-02.jpeg";
import illustration3 from "../assets/images/illustration-03.jpeg";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_CATEGORY,
  createGalleryImage,
} from "./defaults";

export const PLACES_STORAGE_KEY = "uttam-ghosh-places-visited";

export const DEFAULT_PLACES = [
  {
    id: "adivasi",
    title: "Adivasi Areas",
    description:
      "Documentary photography from tribal regions, capturing community life, culture, and everyday stories.",
    images: [
      createGalleryImage(
        illustration2,
        "Community life in tribal regions of central India."
      ),
      createGalleryImage(
        illustration1,
        "Portrait and daily life from an Adivasi village."
      ),
    ],
  },
  {
    id: "drought",
    title: "Drought Pictures",
    description:
      "On-ground visual reporting from drought-affected regions, highlighting people and landscapes in crisis.",
    images: [
      createGalleryImage(
        illustration3,
        "Parched fields and families affected by drought."
      ),
      createGalleryImage(
        illustration2,
        "Documenting water scarcity and rural hardship."
      ),
    ],
  },
  {
    id: "election",
    title: "Election Pictures",
    description:
      "Editorial coverage of elections — campaigns, rallies, voters, and the political pulse of the nation.",
    images: [
      createGalleryImage(
        illustration1,
        "Campaign rally and crowd energy during election season."
      ),
      createGalleryImage(
        illustration3,
        "Voters and political moments on the ground."
      ),
    ],
  },
  {
    id: "fashion",
    title: "Fashion Pictures",
    description:
      "Fashion and lifestyle photography with a sharp editorial eye for form, mood, and storytelling.",
    images: [
      createGalleryImage(
        illustration3,
        "Editorial fashion portrait with bold colour and mood."
      ),
      createGalleryImage(
        illustration2,
        "Lifestyle and style captured through an editorial lens."
      ),
    ],
  },
];

export function createEmptyPlace() {
  return {
    id: crypto.randomUUID(),
    title: "New Place",
    description: "",
    images: [],
  };
}

export function getDefaultPlaceById(id) {
  return DEFAULT_PLACES.find((place) => place.id === id);
}

export function getPlaceCoverImage(place) {
  const first = place?.images?.[0];
  if (!first) return "";
  return typeof first === "string" ? first : first.src || "";
}

export { MAX_IMAGE_BYTES, MAX_IMAGES_PER_CATEGORY as MAX_IMAGES_PER_PLACE };
