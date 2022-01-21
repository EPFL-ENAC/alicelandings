import WebMap from "@/components/WebMap.vue";
import { shallowMount } from "@vue/test-utils";
import { expect } from "chai";

describe("WebMap.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(WebMap, {
      propsData: { msg },
    });
    expect(wrapper.text()).to.include(msg);
  });
});
