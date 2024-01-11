export class StringUtil {
    static removeVietnameseTones(str: string) {
        return str
            .replace(/[áàảạãăắằẳẵặâấầẩẫậ]/gi, 'a')
            .replace(/[éèẻẽẹêếềểễệ]/gi, 'e')
            .replace(/[iíìỉĩị]/gi, 'i')
            .replace(/[óòỏõọôốồổỗộơớờởỡợ]/gi, 'o')
            .replace(/[úùủũụưứừửữự]/gi, 'u')
            .replace(/[ýỳỷỹỵ]/gi, 'y')
            .replace(/[đ]/gi, 'd')
            .replace(/\s+/gi, ' ')
            .replace(/-+/gi, '-');
    }
}
