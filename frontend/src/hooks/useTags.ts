import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, TagCreate, tagsApi } from "@/api/tags";
import { useAuthStore } from "@/stores/authStore";
import { DecryptedTagNode } from "@/api/encryption";

export const useTagTree = () => {
  const { encryptionKey } = useAuthStore();

  return useQuery({
    queryKey: ["tags", "tree"],
    queryFn: tagsApi.list,
    enabled: !!encryptionKey,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tag: TagCreate) => tagsApi.create(tag),

    onMutate: async (newTag) => {
      await queryClient.cancelQueries({ queryKey: ["tags", "tree"] });

      const previousTags = queryClient.getQueryData(["tags", "tree"]);

      queryClient.setQueryData(["tags", "tree"], (old: Tag[] | undefined) => {
        const tempTag: DecryptedTagNode = {
          id: -Date.now(),
          name: newTag.name,
          parentId: newTag.parentId,
          parentPath: "",
          createdAt: new Date().toISOString(),
          children: [],
        };
        return [...(old || []), tempTag];
      });

      return { previousTags };
    },

    onError: (err, newTag, context) => {
      queryClient.setQueryData(["tags", "tree"], context?.previousTags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", "tree"] });
    },
  });
};
