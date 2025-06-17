import { ref, nextTick } from "vue";

export function useAutoScroll() {
  const scrollTarget = ref(null);

  const triggerScroll = async (condition = true) => {
    await nextTick();
    if (condition && scrollTarget.value) {
      scrollTarget.value.scrollIntoView({ behavior: "smooth" });
    }
  };

  return { scrollTarget, triggerScroll };
}