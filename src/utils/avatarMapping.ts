// 头像结果字段映射
export const avatarMapping = {
  activated: {
    yes: '已注册',
    no: '未注册'
  },
  category: {
    'individual portrait': '个人肖像',
    'group photo': '合照',
    'landscape': '风景',
    'cartoon avatar': '动漫头像',
    'pet avatar': '宠物头像',
    'object': '物品'
  },
  gender: {
    male: '男',
    female: '女',
    unknown: '未知'
  },
  hair_color: {
    brown: '棕色',
    black: '黑色',
    'gray white': '灰白',
    unidentifiable: '无法识别'
  },
  skin_color: {
    white: '白',
    hispanic: '西班牙裔',
    brown: '棕色',
    unidentifiable: '无法识别'
  }
}

export const translateResult = (row: any) => {
  return {
    ...row,
    activated_label: avatarMapping.activated[row.activated] || row.activated,
    category_label: avatarMapping.category[row.category] || row.category || '-',
    gender_label: avatarMapping.gender[row.gender] || row.gender || '-',
    hair_color_label: avatarMapping.hair_color[row.hair_color] || row.hair_color || '-',
    skin_color_label: avatarMapping.skin_color[row.skin_color] || row.skin_color || '-'
  }
}
